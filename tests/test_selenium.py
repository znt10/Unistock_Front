import pytest
import time

from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from webdriver_manager.chrome import ChromeDriverManager


@pytest.fixture
def driver():
    service = Service(ChromeDriverManager().install())

    options = webdriver.ChromeOptions()
    options.add_argument("--start-maximized")

    driver = webdriver.Chrome(service=service, options=options)

    yield driver

    driver.quit()


def test_fluxo_completo(driver):
    wait = WebDriverWait(driver, 20)

    # ============================================================
    # 1. LOGIN
    # ============================================================

    driver.get("http://localhost:3000")

    email = wait.until(
        EC.visibility_of_element_located(
            (By.CSS_SELECTOR, '[data-testid="email"]')
        )
    )

    senha = wait.until(
        EC.visibility_of_element_located(
            (By.CSS_SELECTOR, '[data-testid="password"]')
        )
    )

    email.send_keys("asd@gmail.com")
    senha.send_keys("UNIFIP@123")

    botao_login = wait.until(
        EC.element_to_be_clickable(
            (By.CSS_SELECTOR, '[data-testid="submit"]')
        )
    )

    time.sleep(1)
    botao_login.click()

    wait.until(EC.url_contains("/novopedido"))

    print("\n✅ Login realizado com sucesso")

    # ============================================================
    # 2. CRIAR PEDIDO
    # ============================================================

    driver.get("http://localhost:3000/novopedido")

    produto_input = wait.until(
        EC.element_to_be_clickable(
            (By.CSS_SELECTOR, '[data-testid="produto-input"]')
        )
    )

    produto_input.click()
    produto_input.send_keys("cox")

    item = wait.until(
        EC.element_to_be_clickable(
            (By.XPATH, "//li[contains(text(), 'coxinho')]")
        )
    )

    time.sleep(1)
    item.click()

    quantidade = wait.until(
        EC.presence_of_element_located(
            (By.CSS_SELECTOR, 'input[type="number"]')
        )
    )

    quantidade.clear()
    quantidade.send_keys("10")

    descricao = wait.until(
        EC.presence_of_element_located(
            (By.CSS_SELECTOR, "textarea")
        )
    )

    descricao.send_keys("Pedido automático de teste")

    confirmar = wait.until(
        EC.element_to_be_clickable(
            (By.XPATH, "//button[contains(., 'Confirmar Pedido')]")
        )
    )

    time.sleep(1)
    confirmar.click()

    wait.until(EC.alert_is_present())

    alert = driver.switch_to.alert

    print(f"✅ Pedido criado — Alert: {alert.text}")

    alert.accept()

    wait.until(EC.url_contains("/meuspedidos"))

    print("✅ Redirecionado para Meus Pedidos")

    # ============================================================
    # 3. FILTRAR POR STATUS
    # ============================================================

    wait.until(
        EC.presence_of_element_located(
            (By.CSS_SELECTOR, "tbody tr")
        )
    )

    print("\n🔍 Aplicando filtro por STATUS: PENDENTE...")

    select_status = wait.until(
        EC.element_to_be_clickable(
            (By.CSS_SELECTOR, "select")
        )
    )

    time.sleep(1)
    select_status.click()

    opcao = wait.until(
        EC.element_to_be_clickable(
            (By.XPATH, "//option[@value='PENDENTE']")
        )
    )

    time.sleep(1)
    opcao.click()

    wait.until_not(
        EC.text_to_be_present_in_element(
            (By.CSS_SELECTOR, "tbody"),
            "Carregando..."
        )
    )

    linhas = driver.find_elements(By.CSS_SELECTOR, "tbody tr")

    print(f"✅ Filtro STATUS aplicado — {len(linhas)} pedido(s) encontrado(s)")

    for linha in linhas:
        assert "PENDENTE" in linha.text.upper()

    btn_limpar = wait.until(
        EC.element_to_be_clickable(
            (By.XPATH, "//button[contains(., 'Limpar Filtros')]")
        )
    )

    time.sleep(1)
    btn_limpar.click()

    print("✅ Filtro de status limpo")

    # ============================================================
    # 4. FILTRO POR DATA (2026)
    # ============================================================

    data_input_valor = "2026-05-06"
    data_exibicao = "06/05/2026"

    print(f"\n🔍 Aplicando filtro por DATA: {data_exibicao}...")

    input_data = wait.until(
        EC.element_to_be_clickable(
            (By.CSS_SELECTOR, 'input[type="date"]')
        )
    )

    input_data.clear()
    input_data.send_keys(data_input_valor)

    wait.until_not(
        EC.text_to_be_present_in_element(
            (By.CSS_SELECTOR, "tbody"),
            "Carregando..."
        )
    )

    linhas_data = wait.until(
        EC.presence_of_all_elements_located(
            (By.CSS_SELECTOR, "tbody tr")
        )
    )

    print(f"✅ Filtro DATA aplicado — {len(linhas_data)} pedido(s) encontrado(s)")

    for linha in linhas_data:
        data_celula = linha.find_element(
            By.CSS_SELECTOR,
            "td:first-child"
        ).text.strip()

        assert data_exibicao in data_celula

    print("✅ Todas as linhas possuem a data correta")

    btn_limpar = wait.until(
        EC.element_to_be_clickable(
            (By.XPATH, "//button[contains(., 'Limpar Filtros')]")
        )
    )

    time.sleep(1)
    btn_limpar.click()

    print("✅ Filtro de data limpo")

    # ============================================================
    # FIM
    # ============================================================

    print("\n================ FLUXO COMPLETO FINALIZADO ================")
    print("URL FINAL:", driver.current_url)
    print("===========================================================\n")

    assert "/meuspedidos" in driver.current_url