from rest_framework import serializers
from app.models import Estoque, Pedido, ItemPedido, Produto, Loja
from django.contrib.auth.models import Group
from django.contrib.auth.models import User
from django.db import transaction


class ItemPedidoSerializer(serializers.ModelSerializer):
    produto = serializers.PrimaryKeyRelatedField(queryset=Produto.objects.all())
    produto_nome = serializers.ReadOnlyField(source='produto.nome_produto')  # ← adiciona

    class Meta:
        model = ItemPedido
        fields = ['produto', 'produto_nome', 'quantidade'] 



class PedidoSerializer(serializers.ModelSerializer):
    # MUDANÇA 1: required=True (padrão) garante que a chave 'itens' deve ser enviada
    itens = ItemPedidoSerializer(many=True) 
    status = serializers.CharField(read_only=True)
    data = serializers.SerializerMethodField()
    hora = serializers.SerializerMethodField()
    responsavel = serializers.ReadOnlyField(source='responsavel.username')

    class Meta:
        model = Pedido
        fields = ['id', 'responsavel', 'loja', 'status', 'data', 'hora', 'itens', 'descricao']

    def get_data(self, obj):
        return obj.data_pedido.strftime('%Y-%m-%d') if obj.data_pedido else None

    def get_hora(self, obj):
        return obj.data_pedido.strftime('%H:%M:%S') if obj.data_pedido else None

    def validate(self, data):
        itens = data.get('itens', [])

        # MUDANÇA 2: Retornar erro em formato de dicionário para o campo 'itens'
        if not itens:
            raise serializers.ValidationError({"itens": "O pedido precisa ter pelo menos um item."})

        for item in itens:
            if item.get('quantidade', 0) <= 0:
                raise serializers.ValidationError({"itens": "A quantidade de cada item deve ser maior que zero."})

        return data

    @transaction.atomic
    def create(self, validated_data):
        itens_data = validated_data.pop('itens')
        user = self.context['request'].user

        pedido = Pedido.objects.create(
            responsavel=user,
            **validated_data
        )

        for item in itens_data:
            
            ItemPedido.objects.create(
                pedido=pedido,
                responsavel=user,
                **item 
            )

        return pedido

class ProdutoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Produto
        fields = ['id', 'nome_produto', 'codigo', 'unidade_medida', 'ativo']

class UsuarioSerializer(serializers.ModelSerializer):
    tipo_usuario = serializers.ChoiceField(
        choices=['responsavel', 'gerente'],
        write_only=True
    )

    class Meta:
        model = User
        fields = ['id','first_name' ,'email', 'password','tipo_usuario']
        extra_kwargs = {'password': {'write_only': True}}

    # Usar o validador de senho do Django que é bem completo
    # Mas tipo ja é um sistema mais do dia a dia e meio que "fechado" nao vejo ter senha muito complexa para responsavel
    # Ficar entrando e Fica "chato de usar"

    """def validate_password(self, value):
        try:
            validate_password(value)
        except DjangoValidationError as e:
            raise serializers.ValidationError(e.messages)
        return value"""
    
    # deixar um mais simples para o responsavel
    def validate_password(self, value):
        if len(value) < 6:
            raise serializers.ValidationError("A senha deve conter pelo menos 6 caracteres.")
        return value
    
    # Validar se o username já existe para evitar erros de integridade no banco
    def validate_email(self, value):
        value = value.lower()
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError("Este email já está em uso.")
        return value


    def create(self, validated_data):
        senha = validated_data.pop('password')
        email = validated_data.get('email')
        tipo_usuario = validated_data.pop('tipo_usuario')

        user = User(**validated_data)
        user.set_password(senha) 
        user.username = email
        user.save()

        #pega ou cria o grupo
        if tipo_usuario == 'gerente':
            grupo, _ = Group.objects.get_or_create(name='Gerente')
        else:
            grupo, _ = Group.objects.get_or_create(name='Responsavel')

        user.groups.add(grupo)

        return user

class LojaSerializer(serializers.ModelSerializer):
    responsavel_nome = serializers.CharField(source='responsavel.username', read_only=True)

    class Meta:
        model = Loja
        fields = ['id', 'nome_loja', 'tipo', 'cidade','endereco', 'responsavel', 'responsavel_nome','ativo']
    def get_fields(self):
        fields = super().get_fields()
        fields['responsavel'].required = False  
        fields['responsavel'].allow_null = True  
        return fields

class EstoqueSerializer(serializers.ModelSerializer):
    class Meta:
        model = Estoque
        fields = ['id', 'produto', 'loja', 'quantidade_atual', 'quantidade_minima']