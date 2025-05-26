Rotas:
app.routes.ts
app-routing.module.ts (não altera, somente se necessario)

--------------------------------
Tela de Aparelho-Manual
>Componentes:
Calcular
Resultados
monitoramento

>models (teste):
ambiente
aparelho
bandeira
estado

>Services:
api.service

-------------------------------
Tela de Inicio:

Layout (opções - Menus)
Pages -> Home (dentro)

-------------------------------
Tela de Contador-Manual
>Componentes:
Consumo-mensal-calcular
consumo-mensal-listar
gráfico-contador

>Services:
contador.service
-------------------------------
Tela OCR
>Components:
upload-imagem
lista-leituras

>Services:
ocr-contador.service
-------------------------------
Tela OCR Celular (Ainda em Manutenção)
>Components:
leitura-qr

>Services:
ocr-contador-qr
-----------------------------------
Tela de Leitura de Documentação (Relacionado á grande quantia de dados)
>Components:
Em desenvolvimento

>Services:
Em desenvolvimento
-----------------------------------
Tela Login_Cadastro_Django (O proprio Django teria a funcionalidade, padrão e básica(Pesquisa no Chat pra ter certeza))
>Components:
login
register

>Services:
auth.guard
auth.interceptor
auth.service
----------------------------------------
Relacionado ao QRCode e Celular (Em Manutenção)

#-------------Frontend--------------# --> Unica que tem isso é o leitura-qr

Os endereços são diferentes: Exemplo: 10.30.57.32 (Faculdade)

Encontrar local host:

No cmd do Computador:

ipconfig

encontre seu: Endereço IPv4. . . . . . . .  . . . . . . . : 000.000.0.0

No seu componente Angular (leitura-qr.component.ts), ajuste a variável qrData para usar o IP da sua máquina, por exemplo:

http://localhost:4200/leitura-qr --> qrData = 'http://192.168.0.4:4200/leitura-qr';

Quando você rodar o ng serve, use o comando para aceitar conexões externas:
ng serve --host 0.0.0.0

Normal: localhost (Celular não funciona, somente local)
ng serve
