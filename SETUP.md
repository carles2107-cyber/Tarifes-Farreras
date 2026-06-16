# Farreras Sales Tracker - Guia de configuració

## Requisits
- Node.js 18+
- Compte HubSpot amb accés als mòduls CRM

## 1. Token HubSpot
1. Ves a HubSpot > Configuració > Integracions > Aplicacions privades
2. Crea una nova app privada
3. Activa els àmbits: crm.objects.deals.read, crm.objects.contacts.read, crm.objects.owners
4. Copia el token generat

## 2. Variable d entorn
Crea un fitxer de configuració local amb el nom: .env.local
Contingut:
  HUBSPOT_ACCESS_TOKEN=pat-eu1-el-teu-token-aqui

## 3. Instal·lar i executar
  npm install
  npm run dev

Obre http://localhost:3000

## Funcionalitats
- Dashboard: KPIs del mes, facturació, ofertes guanyades, pipeline ponderat
- Pipeline: Tauler Kanban amb les etapes del teu pipeline de HubSpot
- Clients: Llistat de contactes amb cerca i filtre per etapa
- Equip: Rànquing de comercials, podium top 3, gràfic de facturació
