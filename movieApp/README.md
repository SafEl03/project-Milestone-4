# MovieApp – Webontwikkeling Project

Een webapplicatie waarmee je films en regisseurs kunt bekijken, filteren, sorteren en bewerken (alleen als admin). Gebouwd in het kader van het schoolproject Webontwikkeling (Milestone 1 t.e.m. 4).

---

## Functionaliteiten

- ✅ Laden van JSON-data via fetch en automatisch opslaan in MongoDB
- ✅ Overzichtspagina met zoek- en sorteermogelijkheden
- ✅ Detailpagina met afbeelding en alle data
- ✅ Doorklikken naar gerelateerde objecten (bv. regisseurs → films)
- ✅ Beveiligde login met sessies (express-session)
- ✅ Registratie met wachtwoord hashing (bcrypt)
- ✅ Logout functionaliteit
- ✅ Alleen ADMIN mag films bewerken (role-based access)
- ✅ Styling met eigen CSS
- ✅ Responsive layout

---

## Standaardgebruikers

| Rol   | Gebruikersnaam | Wachtwoord |
|-------|----------------|------------|
| Admin | `admin`        | `admin123` |
| User  | `user`         | `user123`  |

---

## Rollen en toegang

- ADMIN: heeft toegang tot alles, inclusief bewerken van films
- USER: kan enkel bekijken en navigeren

---

## Online versie

[https://project-milestone-4-movieapp.vercel.app/]

> **Vervang deze link** door jouw Render/Railway/Glitch/Netlify link zodra je gedeployed hebt.

---

##  Installatie (lokaal)

1. **Clone de repository**

```bash
git clone https://github.com/SafEl03/project-Milestone-4.git
cd movieapp 
