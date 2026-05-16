from tokenize import group

from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated,AllowAny
from rest_framework.exceptions import PermissionDenied
from rest_framework.response import Response
from rest_framework import status
from datetime import datetime, time, timedelta
from django.db.models import Sum, Q
from django.utils import timezone
from django.utils.timezone import make_aware


from django.contrib.auth.models import User

from app.models import Pedido, ItemPedido, Produto, Loja, Estoque
from .mixins import ApenasAdminPodeCriarMixin, ResponsavelOuAdminMixin, UserOuAdminMixin
from .serializers import (
    PedidoSerializer,
    ItemPedidoSerializer,
    ProdutoSerializer,
    UsuarioSerializer,
    LojaSerializer,
    EstoqueSerializer
)
from app.permissions import IsGerenteOrAdministrador, IsGerenteOrAdministradorOrResponsavel
from rest_framework.decorators import action

# 🔹 Helper
def is_gerente_ou_admin(user):
    return user.is_superuser or user.groups.filter(name='Gerente').exists()

    
# 🔹 LOJA
class LojaViewSet(viewsets.ModelViewSet):
    queryset = Loja.objects.all().order_by('id') 
    serializer_class = LojaSerializer
    lookup_field = 'public_id'
    
    def get_permissions(self):
        if self.action == 'list':
            return [AllowAny()]
        return [IsAuthenticated()]


# 🔹 ESTOQUE
class EstoqueViewSet(viewsets.ModelViewSet,ResponsavelOuAdminMixin):
    queryset = Estoque.objects.all()
    serializer_class = EstoqueSerializer
    permission_classes = [IsAuthenticated,IsGerenteOrAdministrador]
    lookup_field = 'public_id'


# 🔹 PRODUTO
class ProdutoViewSet(viewsets.ModelViewSet):
    queryset = Produto.objects.all().order_by('nome_produto')
    serializer_class = ProdutoSerializer
    lookup_field = 'public_id'

    def get_permissions(self):
        if self.action == 'list':
            return [AllowAny()]
        return [IsAuthenticated(), IsGerenteOrAdministrador()]


# 🔹 ITEM PEDIDO 
class ItemPedidoViewSet(ResponsavelOuAdminMixin,viewsets.ModelViewSet):
    queryset = ItemPedido.objects.all()
    serializer_class = ItemPedidoSerializer
    permission_classes = [IsAuthenticated,IsGerenteOrAdministradorOrResponsavel]
    lookup_field = 'public_id'

    def get_queryset(self):
        user = self.request.user

        if is_gerente_ou_admin(user):
            return ItemPedido.objects.all()

        return ItemPedido.objects.filter(pedido__responsavel=user)



# 🔹 PEDIDO 
class PedidoViewSet( viewsets.ModelViewSet):
    queryset = Pedido.objects.all().order_by('-data_pedido')
    serializer_class = PedidoSerializer
    permission_classes = [IsAuthenticated]
    lookup_field = 'public_id'

    def get_queryset(self):
        user = self.request.user
        queryset = Pedido.objects.all().order_by('-data_pedido')
        

        if not is_gerente_ou_admin(user):
            queryset = queryset.filter(loja__in=user.loja_set.all())

        status = self.request.query_params.get('status')
        data = self.request.query_params.get('data')
        loja = self.request.query_params.get('loja')

        if status:
            queryset = queryset.filter(status=status)

        if loja:
            queryset = queryset.filter(loja__public_id=loja)

        if data:
            data_inicio = make_aware(
                datetime.combine(
                    datetime.strptime(data, "%Y-%m-%d").date(),
                    time.min
                )
            )

            data_fim = make_aware(
                datetime.combine(
                    datetime.strptime(data, "%Y-%m-%d").date(),
                    time.max
                )
            )

            queryset = queryset.filter(
                data_pedido__range=(data_inicio, data_fim)
            )

        return queryset

    @action(detail=False, methods=['get'], url_path='dashboard')
    def dashboard(self, request):
        hoje = timezone.localdate()
        periodo = request.query_params.get('periodo', 'week')
        status_filtro = request.query_params.get('status')
        search = request.query_params.get('search')

        queryset = self.get_queryset()

        if periodo == 'today':
            queryset = queryset.filter(data_pedido__date=hoje)
        elif periodo == 'week':
            inicio_semana = hoje - timedelta(days=6)
            queryset = queryset.filter(data_pedido__date__range=(inicio_semana, hoje))
        elif periodo == 'month':
            queryset = queryset.filter(
                data_pedido__year=hoje.year,
                data_pedido__month=hoje.month
            )

        if status_filtro:
            queryset = queryset.filter(status=status_filtro)

        if search:
            queryset = queryset.filter(
                Q(loja__nome_loja__icontains=search) |
                Q(responsavel__first_name__icontains=search) |
                Q(responsavel__username__icontains=search) |
                Q(descricao__icontains=search)
            )

        pedidos_hoje = self.get_queryset().filter(data_pedido__date=hoje).count()
        pendentes = self.get_queryset().filter(status=Pedido.Status.PENDENTE).count()
        entregues_semana = self.get_queryset().filter(
            status=Pedido.Status.ENTREGUE,
            data_pedido__date__gte=hoje - timedelta(days=6),
            data_pedido__date__lte=hoje
        ).count()

        pedidos_recentes = (
            queryset
            .select_related('loja', 'responsavel')
            .prefetch_related('itens')
            .annotate(total_quantidade=Sum('itens__quantidade'))
            .order_by('-data_pedido')[:10]
        )

        return Response({
            "metricas": {
                "pedidos_hoje": pedidos_hoje,
                "pendentes": pendentes,
                "entregues_semana": entregues_semana,
                "total_filtrado": queryset.count(),
            },
            "pedidos_recentes": [
                {
                    "id": pedido.public_id,
                    "loja": pedido.loja.nome_loja if pedido.loja else "Sem loja",
                    "responsavel": pedido.responsavel.first_name or pedido.responsavel.username,
                    "quantidade_total": pedido.total_quantidade or 0,
                    "status": pedido.status,
                    "data": pedido.data_pedido.strftime('%d/%m/%Y'),
                    "hora": pedido.data_pedido.strftime('%H:%M'),
                }
                for pedido in pedidos_recentes
            ]
        })

# 🔹 USUÁRIO
class UsuarioViewSet(UserOuAdminMixin, viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UsuarioSerializer
    permission_classes = [IsAuthenticated]

    @action(detail=False, methods=['get'], url_path='me')
    def me(self, request):
            user = request.user
            
            group = None
            if user.groups.exists():
                group = user.groups.first().name

            # Busca a loja vinculada (ajuste o filtro conforme seu banco)
            loja_vinculada = Loja.objects.filter(responsavel=user).first()

            return Response({
                "id": user.id,
                "first_name": user.first_name,
                "email": user.email,
                "group": group,
                "loja": {
                    "id": loja_vinculada.public_id,
                    "nome": loja_vinculada.nome_loja
                } if loja_vinculada else None
            })
    
    def create(self, request, *args, **kwargs):
        return Response(
            {"detail": "Use /users/registrar/ para criar usuários."},
            status=status.HTTP_405_METHOD_NOT_ALLOWED
        )

    @action(detail=False, methods=['post'], permission_classes=[AllowAny]) # Permitir deslogado criar conta
    def registrar(self, request):
        data = request.data
        id_loja = data.get('id_loja') # ID vindo do select do React
        tipo_usuario = data.get('tipo_usuario')

        serializer = self.get_serializer(data=data)
        if serializer.is_valid():
            user = serializer.save() # Cria o usuário

            # 1. Adicionar ao grupo correto
            from django.contrib.auth.models import Group
            group_name = 'Gerente' if tipo_usuario == 'gerente' else 'Responsavel'
            grupo = Group.objects.get(name=group_name)
            user.groups.add(grupo)

            # 2. Se for Responsável, vincula à loja
            if group_name == 'Responsavel' and id_loja:
                try:
                    loja = Loja.objects.get(public_id=id_loja)
                    # Se o seu model Loja tem o campo 'responsavel':
                    loja.responsavel = user 
                    loja.save()
                except Loja.DoesNotExist:
                    return Response({"error": "Loja não encontrada"}, status=status.HTTP_400_BAD_REQUEST)

            return Response(serializer.data, status=status.HTTP_201_CREATED)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
