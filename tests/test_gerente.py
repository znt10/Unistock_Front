import pytest
import time
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.support.ui import WebDriverWait, Select
from selenium.webdriver.support import expected_conditions as EC
from webdriver_manager.chrome import ChromeDriverManager

@pytest.fixture(scope="module")
def driver():
    service = Service(ChromeDriverManager().install())
    options = webdriver.ChromeOptions()
    options.add_argument("--start-maximized")
    driver = webdriver.Chrome(service=service, options=options)
    yield driver
    driver.quit()

def realizar_cadastro_unidade(driver, wait, tipo_unidade, nome, cidade, endereco):
    print(f"--- Apresentando Cadastro de {tipo_unidade}: {nome} ---")
    
    btn_nova = wait.until(EC.element_to_be_clickable((By.XPATH, "//a[@href='/lojas/novaloja']")))
    time.sleep(1.5) # Pausa para ver o botão antes do clique
    btn_nova.click()

    texto_botao = "Fábrica" if tipo_unidade == "Fabrica" else "Loja"
    wait.until(EC.element_to_be_clickable((By.XPATH, f"//button[contains(text(), '{texto_botao}')]"))).click()
    time.sleep(1)

    # Preenchimento pausado para visualização
    input_nome = wait.until(EC.presence_of_element_located((By.XPATH, "//input[@placeholder='EX: UNIDADE CENTRAL PATOS']")))
    input_nome.send_keys(nome)
    time.sleep(0.5)
    
    driver.find_element(By.XPATH, "//input[@placeholder='CIDADE']").send_keys(cidade)
    time.sleep(0.5)
    
    driver.find_element(By.XPATH, "//input[@placeholder='RUA, NÚMERO, BAIRRO']").send_keys(endereco)
    time.sleep(1.5) # Pausa para a plateia ler os dados preenchidos

    driver.find_element(By.XPATH, "//button[contains(text(), 'Salvar Unidade')]").click()
    
    # Lidar com Alerta
    wait.until(EC.alert_is_present())
    time.sleep(1) # Ver o alerta na tela
    driver.switch_to.alert.accept()
    
    wait.until(EC.url_to_be("http://localhost:3000/lojas"))
    wait.until_not(EC.text_to_be_present_in_element((By.TAG_NAME, "tbody"), "Carregando..."))
    time.sleep(1)

def test_fluxo_apresentacao_unistock(driver):
    wait = WebDriverWait(driver, 15)

    # ==========================================
    # 1. LOGIN (Demonstração)
    # ==========================================
    driver.get("http://localhost:3000")
    print("Iniciando demonstração de Login...")
    
    input_email = wait.until(EC.visibility_of_element_located((By.CSS_SELECTOR, '[data-testid="email"]')))
    input_email.send_keys("jc98zxdjx@gmail.com")
    time.sleep(0.5)
    
    input_pass = driver.find_element(By.CSS_SELECTOR, '[data-testid="password"]')
    input_pass.send_keys("123456")
    time.sleep(1)
    
    driver.find_element(By.CSS_SELECTOR, '[data-testid="submit"]').click()
    print("✅ Login realizado.")
    time.sleep(2) # Pausa no Dashboard

    # ==========================================
    # 2. GESTÃO DE UNIDADES
    # ==========================================
    wait.until(EC.element_to_be_clickable((By.XPATH, "//span[contains(text(), 'Gerenciar Lojas')]"))).click()
    wait.until_not(EC.text_to_be_present_in_element((By.TAG_NAME, "tbody"), "Carregando..."))
    time.sleep(1)

    realizar_cadastro_unidade(driver, wait, "Fabrica", "FÁBRICA MATRIZ", "Campina Grande", "Rua Industrial, 10")
    realizar_cadastro_unidade(driver, wait, "Loja", "LOJA TESTE REGISTRO", "Patos", "Rua do Comércio, 50")

    # ==========================================
    # 3. PAINEL DE UNIDADE (PEDIDOS E PDF)
    # ==========================================
    print("Acessando Painel de Unidade para demonstração...")
    wait.until(EC.element_to_be_clickable((By.XPATH, "//span[contains(text(), 'Painel unidade')]"))).click()
    time.sleep(2)

    print("Visualizando pedidos da loja...")
    btn_pedidos = wait.until(EC.element_to_be_clickable((By.XPATH, "//button[contains(text(), 'Ver Pedidos da Loja')]")))
    btn_pedidos.click()
    
    wait.until(EC.url_contains("/meuspedidos"))
    time.sleep(3) # Tempo para explicar a tela de pedidos
    driver.back() 
    
    time.sleep(2) # Pausa após voltar para o painel
    print("Gerando Relatório PDF...")
    wait.until(EC.element_to_be_clickable((By.XPATH, "//button[contains(., 'Visualizar Hoje')]"))).click()
    
    # Manipulação de Abas
    wait.until(lambda d: len(d.window_handles) > 1)
    janela_principal = driver.current_window_handle
    for janela in driver.window_handles:
        if janela != janela_principal:
            driver.switch_to.window(janela)
            print("PDF aberto em nova aba. Aguardando visualização...")
            time.sleep(4) # Tempo maior para mostrar o PDF gerado
            driver.close()
            break
    driver.switch_to.window(janela_principal)
    time.sleep(1)

    # ==========================================
    # 4. NAVEGAÇÃO PARA USUÁRIOS E REGISTRO
    # ==========================================
    print("Navegando para o gerenciamento de Usuários...")
    btn_usuarios = wait.until(EC.element_to_be_clickable((By.XPATH, "//span[contains(text(), 'Usuários')]")))
    btn_usuarios.click()
    time.sleep(2)

    # Note: O seu código React renderiza o form de registro na tela de Usuários? 
    # Se sim, mantemos o clique no toggle:
    print("Demonstrando alternância para perfil 'Responsável'...")
    btn_resp = wait.until(EC.element_to_be_clickable((By.XPATH, "//button[contains(text(), 'Responsável')]")))
    btn_resp.click()
    time.sleep(1.5)

    print("Preenchendo novo usuário...")
    driver.find_element(By.XPATH, "//input[@placeholder='Seu nome completo']").send_keys("Responsável Demonstração")
    time.sleep(0.5)
    driver.find_element(By.XPATH, "//input[@placeholder='seu@email.com']").send_keys(f"apresentacao_{int(time.time())}@email.com")
    time.sleep(0.5)
    driver.find_element(By.XPATH, "//input[@placeholder='Sua senha']").send_keys("123456")
    time.sleep(1)

    # Seleção da Loja no Dropdown
    select_elem = wait.until(EC.presence_of_element_located((By.ID, "loja")))
    wait.until(lambda d: len(d.find_elements(By.XPATH, "//select[@id='loja']/option")) > 1)
    
    dropdown = Select(select_elem)
    dropdown.select_by_index(1) 
    print(f"✅ Loja selecionada: {dropdown.first_selected_option.text}")
    time.sleep(2) # Pausa para mostrar a loja selecionada no select

    driver.find_element(By.XPATH, "//button[contains(text(), 'Continuar')]").click()
    
    # Sucesso Final
    wait.until(EC.url_contains("/dashboard"))
    time.sleep(2)
    
    print("\n==============================================")
    print("   APRESENTAÇÃO CONCLUÍDA COM SUCESSO!")
    print("==============================================")