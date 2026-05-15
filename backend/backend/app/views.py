import django
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework import status
from django.contrib.auth import authenticate
from django.conf import settings
from django.contrib.auth.models import Group
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework.permissions import  IsAuthenticated
from django.http import HttpResponse
from django.template.loader import render_to_string
from .models import Loja, Pedido
from django.contrib.auth import get_user_model
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from django.utils.decorators import method_decorator
from django.views.decorators.csrf import csrf_exempt
User = get_user_model()
from reportlab.lib.pagesizes import A4
from django.utils import timezone
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, HRFlowable
from reportlab.lib.enums import TA_CENTER, TA_LEFT, TA_RIGHT
from rest_framework_simplejwt.views import TokenRefreshView
from rest_framework_simplejwt.exceptions import InvalidToken, TokenError
from rest_framework_simplejwt.serializers import TokenRefreshSerializer
from rest_framework_simplejwt.settings import api_settings


def relatorio_pdf(request):
    # --- Lógica de Data ---
    agora_local = timezone.localtime(timezone.now())
    hoje_data = agora_local.date()
    inicio_dia = agora_local.replace(hour=0, minute=0, second=0, microsecond=0)
    fim_dia = agora_local.replace(hour=23, minute=59, second=59, microsecond=999999)

    # --- QuerySet Otimizada ---
    pedidos = Pedido.objects.filter(
        data_pedido__range=(inicio_dia, fim_dia)
    ).select_related('responsavel', 'loja').prefetch_related('itens__produto').order_by(
        'loja__nome_loja', 'responsavel__first_name', '-data_pedido'
    )

    response = HttpResponse(content_type='application/pdf')
    response['Content-Disposition'] = f'attachment; filename="Relatorio_{hoje_data}.pdf"'

    # Margens menores para aproveitar melhor o espaço
    doc = SimpleDocTemplate(response, pagesize=A4, leftMargin=40, rightMargin=40, topMargin=50, bottomMargin=50)
    styles = getSampleStyleSheet()

    # --- Paleta de Cores e Estilos ---
    COR_PRIMARIA = colors.HexColor("#2C3E50")  # Azul Petróleo Escuro
    COR_SECUNDARIA = colors.HexColor("#34495E") # Cinza Azulado
    COR_DESTAQUE = colors.HexColor("#3498DB")  # Azul Profissional
    COR_ZEBRA = colors.HexColor("#F8F9F9")     # Cinza quase branco

    style_titulo = ParagraphStyle(
        'Tit', parent=styles['Title'], fontSize=24, textColor=COR_PRIMARIA, 
        alignment=TA_LEFT, spaceAfter=10, fontName='Helvetica-Bold'
    )
    
    style_loja = ParagraphStyle(
        'LojaStyle', parent=styles['Heading1'], fontSize=16, textColor=colors.white,
        backColor=COR_PRIMARIA, borderPadding=8, spaceBefore=20, spaceAfter=10,
        borderRadius=3
    )
    
    style_resp = ParagraphStyle(
        'RespStyle', parent=styles['Heading2'], fontSize=12, textColor=COR_DESTAQUE,
        leftIndent=0, spaceBefore=12, spaceAfter=8, fontName='Helvetica-Bold'
    )

    elementos = []

    # --- Cabeçalho de Identidade ---
    elementos.append(Paragraph("Relatório Gerencial de Pedidos", style_titulo))
    elementos.append(Paragraph(f"<b>Data de Emissão:</b> {hoje_data.strftime('%d/%m/%Y')} | <b>Total de Pedidos:</b> {pedidos.count()}", styles['Normal']))
    elementos.append(Spacer(1, 10))
    elementos.append(HRFlowable(width="100%", thickness=1, color=COR_SECUNDARIA, spaceAfter=20))

    if not pedidos.exists():
        elementos.append(Spacer(1, 50))
        elementos.append(Paragraph("<i>Nenhum pedido registrado nas últimas 24 horas.</i>", styles['Normal']))
    else:
        ultimo_loja = None
        ultimo_resp = None

        for pedido in pedidos:
            # Agrupamento por Loja
            if pedido.loja.nome_loja != ultimo_loja:
                elementos.append(Paragraph(f"UNIDADE: {pedido.loja.nome_loja.upper()}", style_loja))
                ultimo_loja = pedido.loja.nome_loja
                ultimo_resp = None

            # Agrupamento por Responsável
            resp_nome = pedido.responsavel.get_full_name() or pedido.responsavel.username
            if resp_nome != ultimo_resp:
                elementos.append(Paragraph(f"• Responsável: {resp_nome}", style_resp))
                ultimo_resp = resp_nome

            # Info do Pedido
            info_txt = f"<b>PEDIDO #{pedido.id}</b> — <font color='#7F8C8D'>{pedido.data_pedido.strftime('%H:%M')}</font>"
            elementos.append(Paragraph(info_txt, styles['Normal']))
            elementos.append(Spacer(1, 5))
            
            # --- Tabela Customizada ---
            dados = [["PRODUTO", "QTD"]]
            for item in pedido.itens.all():
                dados.append([item.produto.nome_produto.upper(), f"{item.quantidade} un"])

            tabela = Table(dados, colWidths=[360, 80])
            tabela.setStyle(TableStyle([
                ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
                ('FONTSIZE', (0, 0), (-1, 0), 10),
                ('BACKGROUND', (0, 0), (-1, 0), COR_SECUNDARIA),
                ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
                ('ALIGN', (1, 0), (1, -1), 'CENTER'),
                ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
                ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
                ('TOPPADDING', (0, 0), (-1, -1), 6),
                ('GRID', (0, 0), (-1, -1), 0.2, colors.lightgrey),
                ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, COR_ZEBRA]),
            ]))
            
            elementos.append(tabela)
            elementos.append(Spacer(1, 15))

    # --- Função para Numeração de Páginas ---
    def add_page_number(canvas, doc):
        canvas.saveState()
        canvas.setFont('Helvetica', 9)
        canvas.setStrokeColor(colors.lightgrey)
        canvas.line(40, 30, 555, 30) # Linha decorativa no rodapé
        page_num = canvas.getPageNumber()
        text = f"Página {page_num}"
        canvas.drawRightString(555, 20, text)
        canvas.drawString(40, 20, "Sistema de Gestão de Pedidos - Interno")
        canvas.restoreState()

    doc.build(elementos, onLaterPages=add_page_number, onFirstPage=add_page_number)
    return response




class CookieTokenRefreshView(TokenRefreshView):
    def post(self, request, *args, **kwargs):
        # 1. Pega o refresh token que está salvo no cookie
        refresh_token = request.COOKIES.get('refresh_token')

        if not refresh_token:
            return Response(
                {"detail": "Refresh token não encontrado no cookie."}, 
                status=status.HTTP_403_FORBIDDEN
            )

        try:
            serializer = TokenRefreshSerializer(data={'refresh': refresh_token})
            serializer.is_valid(raise_exception=True)
            response = Response(serializer.validated_data, status=status.HTTP_200_OK)
        except TokenError as e:
            raise InvalidToken(e.args[0])

        access_token = response.data.get('access')
        if access_token:
            response.set_cookie(
                key='access_token',
                value=access_token,
                httponly=True, 
                secure=not settings.DEBUG,
                samesite='Lax',
                path='/',
                max_age=int(api_settings.ACCESS_TOKEN_LIFETIME.total_seconds()),
            )
            
            
        return response
    


class LoginView(APIView):
    def post(self, request):
        email = request.data.get('email')
        password = request.data.get('password')

        user = authenticate(username=email, password=password)


        if not user:
            return Response(
                {'error': 'Credenciais inválidas'},
                status=status.HTTP_401_UNAUTHORIZED)


        refresh = RefreshToken.for_user(user)
        access = refresh.access_token
        group = user.groups.first()

        if group is None:
            return Response(
                {'error': 'Usuario sem grupo. Adicione o usuario ao grupo Gerente ou Responsavel.'},
                status=status.HTTP_403_FORBIDDEN
            )

        role = group.name
        loja_vinculada = Loja.objects.filter(responsavel=user).first()
        
        response = Response({
            'message': 'Login realizado com sucesso',
            'user': {
                'id': user.id,
                'email': user.email,
                'first_name': user.first_name,
                'group': role,
                'loja': {
                    'id': loja_vinculada.public_id,
                    'nome': loja_vinculada.nome_loja,
                } if loja_vinculada else None,
            },
            })
        
        cookie_args = {
                    'httponly': True,
                    'secure': not settings.DEBUG, 
                    'samesite': 'Lax',
                    'path': '/',
                }

        response.set_cookie(
            key='access_token',
            value=str(access),
            max_age=int(access.lifetime.total_seconds()),
            **cookie_args
        )
       
        response.set_cookie(
            key='refresh_token',
            value=str(refresh),
            max_age=int(refresh.lifetime.total_seconds()),
            **cookie_args
        )

    
        response.set_cookie(
            key='role',
            value=role,
            max_age=int(refresh.lifetime.total_seconds()),
            **cookie_args
        )

        return response
    


class LogoutView(APIView):

    @method_decorator(csrf_exempt)
    def post(self, request):
        response = Response({"message": "Logout realizado com sucesso"})
        
        response.delete_cookie('access_token', path='/', samesite='Lax')
        response.delete_cookie('refresh_token', path='/', samesite='Lax')
        response.delete_cookie('role', path='/', samesite='Lax')
        
        return response
