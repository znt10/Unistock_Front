import time
import pytest

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


def test_criar_pedido(driver):
    wait = WebDriverWait(driver, 15)

    # 1. abrir login
    driver.get("http://localhost:3000")

    # 2. login
    email = wait.until(
        EC.visibility_of_element_located((By.CSS_SELECTOR, '[data-testid="email"]'))
    )
    senha = wait.until(
        EC.visibility_of_element_located((By.CSS_SELECTOR, '[data-testid="password"]'))
    )

    email.send_keys("asd@gmail.com")
    senha.send_keys("UNIFIP@123")

    time.sleep(1)

    botao_login = wait.until(
        EC.element_to_be_clickable((By.CSS_SELECTOR, '[data-testid="submit"]'))
    )
    botao_login.click()

    # 3. ir para tela de pedido
    wait.until(EC.url_contains("/novopedido"))
    driver.get("http://localhost:3000/novopedido")

    # 4. selecionar produto (Autocomplete)
    produto_input = wait.until(
        EC.presence_of_element_located((By.CSS_SELECTOR, "input"))
    )
    produto_input.click()
    produto_input.send_keys("")

    time.sleep(1)

    # tenta clicar no primeiro item da lista
    # abre dropdown
    produto_input = wait.until(
        EC.element_to_be_clickable((By.CSS_SELECTOR, '[data-testid="produto-input"]'))
    )

    produto_input.click()
    produto_input.send_keys("cox")

    # espera item aparecer pelo texto (MELHOR PRÁTICA)
    item = wait.until(
        EC.element_to_be_clickable(
            (By.XPATH, "//li[contains(text(), 'coxinho')]")
        )
    )

    item.click()

    time.sleep(1)

    # 5. quantidade
    quantidade = wait.until(
        EC.presence_of_element_located((By.CSS_SELECTOR, 'input[type="number"]'))
    )
    quantidade.clear()
    quantidade.send_keys("10")

    time.sleep(1)

    # 6. descrição
    descricao = driver.find_element(By.CSS_SELECTOR, "textarea")
    descricao.send_keys("Pedido automático de teste")

    time.sleep(1)

    # 7. clicar em confirmar
    confirmar = wait.until(
        EC.element_to_be_clickable((By.XPATH, "//button[contains(., 'Confirmar Pedido')]"))
    )
    confirmar.click()

    # espera alert aparecer
    wait.until(EC.alert_is_present())

    alert = driver.switch_to.alert
    print("ALERT:", alert.text)
    alert.accept()

    # agora sim navega
    wait.until(EC.url_contains("/meuspedidos"))

    print("\n================ TESTE FINALIZADO ================\n")
    print("URL FINAL:", driver.current_url)
    print("=================================================\n")

    time.sleep(200)

    assert "/meuspedidos" in driver.current_url