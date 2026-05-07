from django.db import models
from django.contrib.auth.models import User

class BaseModel(models.Model):
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    is_deleted = models.BooleanField(default=False)

    class Meta:
        abstract = True

    def soft_delete(self):
        self.is_deleted = True
        self.save()

class Loja(BaseModel):
    nome_loja = models.CharField(max_length=100)
    tipo = models.CharField(max_length=50, null=True, blank=True)
    cidade = models.CharField(max_length=100)
    endereco = models.CharField(max_length=255)
    ativo = models.BooleanField(default=True)
    responsavel = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)

    def __str__(self):
        return self.nome_loja



class Produto(BaseModel):
    nome_produto = models.CharField(max_length=100)
    codigo = models.CharField(max_length=50)
    unidade_medida = models.CharField(max_length=20)
    ativo = models.BooleanField(default=True)

    def __str__(self):
        return self.nome_produto
    

class Pedido(BaseModel):
    
    responsavel = models.ForeignKey(User, on_delete=models.CASCADE)
    loja = models.ForeignKey(Loja, on_delete=models.CASCADE)
    status = models.CharField(max_length=50)
    descricao = models.TextField(blank=True, null=True)
    data_pedido = models.DateTimeField(auto_now_add=True)

    produtos = models.ManyToManyField(
        Produto,
        through='ItemPedido',
        related_name='pedidos'
    )
    
    def __str__(self):
        user_repr = self.responsavel.username if self.responsavel else "Unknown"
        loja_nome = self.loja.nome_loja if self.loja else "Unknown"
        return f"Pedido {self.id} - {user_repr} - {loja_nome}"


class ItemPedido(BaseModel):
    pedido = models.ForeignKey(Pedido, on_delete=models.CASCADE, related_name='itens')
    produto = models.ForeignKey(Produto, on_delete=models.CASCADE)
    quantidade = models.IntegerField()
    responsavel = models.ForeignKey(User, on_delete=models.CASCADE)
    
    def __str__(self):
        return f"{self.quantidade} x {self.produto.nome_produto} (Pedido {self.pedido.id})"


class Estoque(BaseModel):
    produto = models.ForeignKey(Produto, on_delete=models.CASCADE)
    loja = models.ForeignKey(Loja, on_delete=models.CASCADE)
    quantidade_atual = models.IntegerField()
    quantidade_minima = models.IntegerField()

    def __str__(self):
        return f"Estoque de {self.produto.nome_produto} na {self.loja.nome_loja}"
