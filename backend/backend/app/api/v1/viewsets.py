from tokenize import group

from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated,AllowAny
from rest_framework.exceptions import PermissionDenied
from rest_framework.response import Response
from rest_framework import status

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
    
    def get_permissions(self):
        if self.action == 'list':
            return [AllowAny()]
        return [IsAuthenticated()]


# 🔹 ESTOQUE
class EstoqueViewSet(viewsets.ModelViewSet,ResponsavelOuAdminMixin):
    queryset = Estoque.objects.all()
    serializer_class = EstoqueSerializer
    permission_classes = [IsAuthenticated,IsGerenteOrAdministrador]


# 🔹 PRODUTO
class ProdutoViewSet(viewsets.ModelViewSet):
    queryset = Produto.objects.all().order_by('nome_produto')
    serializer_class = ProdutoSerializer

    def get_permissions(self):
        if self.action == 'list':
            return [AllowAny()]
        return [IsAuthenticated(), IsGerenteOrAdministrador()]


# 🔹 ITEM PEDIDO 
class ItemPedidoViewSet(ResponsavelOuAdminMixin,viewsets.ModelViewSet):
    queryset = ItemPedido.objects.all()
    serializer_class = ItemPedidoSerializer
    permission_classes = [IsAuthenticated,IsGerenteOrAdministradorOrResponsavel]

    def get_queryset(self):
        user = self.request.user

        if is_gerente_ou_admin(user):
            return ItemPedido.objects.all()

        return ItemPedido.objects.filter(pedido__responsavel=user)



# 🔹 PEDIDO 
class PedidoViewSet( viewsets.ModelViewSet):
    queryset = Pedido.objects.all().order_by('-data_pedido')
    serializer_class = PedidoSerializer
    permission_classes = [IsAuthenticated,IsGerenteOrAdministradorOrResponsavel]


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
                    "id": loja_vinculada.id,
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
                    loja = Loja.objects.get(id=id_loja)
                    # Se o seu model Loja tem o campo 'responsavel':
                    loja.responsavel = user 
                    loja.save()
                except Loja.DoesNotExist:
                    return Response({"error": "Loja não encontrada"}, status=status.HTTP_400_BAD_REQUEST)

            return Response(serializer.data, status=status.HTTP_201_CREATED)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)