# Gagellan Society OS

One website for the company **Gagellan**, the societies that buy the product, the residents, and the gate staff.

Data is saved in this browser (localStorage). Nothing here talks to the old database.

## Open the website

```bash
npm install
npm run dev
```

Then open **http://localhost:3100**

## Sign in as Gagellan

This is the company view: who bought a plan, how much they pay, and which product-support tickets are open. It does not show resident names or gate logs.

1. Go to http://localhost:3100/login
2. Choose **Gagellan company**, or type:
   - Email: `gagellan@gagellan.io`
   - Password: `gagellan123`
3. You land on **How the business is running**.

Use the left menu (or the bottom menu on a phone):

- **Overview** — revenue, paying societies, trials, open tickets, and the buyer table
- **Societies** — every customer, their plan, and their join code. Add or edit a society here
- **Plans** — change a monthly price
- **Help desk** — product support from society admins (not complaints inside a society)

## Other demo logins

| Who | Email | Password | What you should see |
|---|---|---|---|
| Society admin | karthik@silverwood.in | admin123 | Silverwood only: residents, gates, reports, plan, support |
| Resident | ananya@silverwood.in | resident123 | Home, visitors, parcels, flat A-101, notices |
| Gatekeeper | suresh@silverwood.in | guard123 | Large gate desk: visitors, parcels, staff check-in |

Aura Towers is a second customer (`priya@auratowers.in` / `admin123`) so you can confirm Silverwood cannot see Aura.

## Check it yourself

1. **Website.** Open http://localhost:3100. Read the plans. You are not signed in yet.
2. **Buy a society.** Open **Plans**, fill the form, and press **Pay and activate**. Note the admin email, password, and join code. Sign in with those. Then sign in as Gagellan and confirm the new row is in the buyer table as paid.
3. **Trial.** Buy again with **Start a free trial instead**. Gagellan’s overview should show it as a trial with no revenue.
4. **Company dashboard.** As Gagellan, confirm Silverwood is paid (₹5,999) and Aura is a trial. Open a help-desk ticket and set it to resolved.
5. **Society admin.** Sign in as Karthik. Invite a resident, then press **Activate**. Open **Gates** and turn on auto-approve for deliveries. Open **Plan** and copy the join code `SW-2026`. Open **Support** and send a ticket. Sign back in as Gagellan and see that ticket.
6. **Resident.** Sign in as Ananya. Approve or reject a visitor. Pre-approve a guest. On **Parcels**, press **Leave at gate**. Open **Notices** and **Profile**.
7. **Join.** Sign out. Open **Join a society**, use code `SW-2026`, and create a new resident. Sign in with that email.
8. **Gate.** Sign in as Suresh. Search “Ananya”. Send a visitor request. Open **parcel**, log a package, and hand it over with the code. Open **staff** and check someone in.
9. **Wrong role.** While signed in as Ananya, go to http://localhost:3100/super. You should be sent back to the resident home.
10. **Reset.** On the sign-in page, press **Reset demo data** if you want the original Silverwood and Aura records back.

## What was kept from the old product

The old repo was several apps plus a database. Those apps are gone. These behaviours now live in this one site:

- A public page where a society buys a plan
- A Gagellan dashboard of buyers, revenue, and support tickets
- Society admin, resident app, and gate desk
- Each society’s data stays on that society (`societyId`)
