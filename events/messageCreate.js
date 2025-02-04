const Discord = require("discord.js")
const Config = require("../config.json")
const Papa = require("papaparse")
const axios = require("axios")
require("dotenv").config()

module.exports = async (bot, message) => {
  let db = bot.db
  if (message.author.bot) return

  if (message.content.toLowerCase() === "!import") {
    const member = await message.guild.members.fetch(message.author.id)
    if (!member.roles.cache.has(Config.roles.admin)) {
      return
    } else {
      async function fetchSheetData() {
        const url =
          "https://docs.google.com/spreadsheets/d/e/2PACX-1vRGaqycSyg1AGPzLuGJe2HJtC_Jv6jIqWlYZS4dKEh_w0RYSuhLO2ZHRFhaBn7F3RsFcElWfKIRUpmF/pub?gid=0&single=true&output=csv"
        try {
          const response = await axios.get(url)
          const csvText = response.data

          const parsed = Papa.parse(csvText, { header: true })
          const data = parsed.data

          for (const row of data) {
            const gamerTag = row["Gamertag Forcé"]
            const number = row["N°"]
            const idPSXBOX = row["ID PS / XBOX"]
            const platform =
              row["ID PS / XBOX"].charAt(0) === "P"
                ? "Playstation"
                : row["ID PS / XBOX"].charAt(0) === "M"
                ? "Xbox"
                : "Inconnu"
            const discordID = row["ID Discord"]

            if (!discordID || discordID.trim() === "") continue

            await db
              .promise()
              .query(
                `INSERT INTO users (userID, inGameUsername, inGameNumber, teamID, platformID, platformConsole, licencePoints) VALUES (?, ?, ?, ?, ?, ?, ?)`,
                [discordID, gamerTag, number, "None", idPSXBOX, platform, 12]
              )
          }
          console.log("Données insérées en BDD !")
        } catch (error) {
          console.error("Erreur lors de l'import des données :", error)
        }
      }

      await fetchSheetData()
      message.delete()
      message.reply("Données en cours d'importation depuis le google sheet")
    }
  }

  if (message.content.toLowerCase() === "send:embeds") {
    const member = await message.guild.members.fetch(message.author.id)
    if (!member.roles.cache.has(Config.roles.admin)) {
      return
    } else {
      const embedGestionOfAllBotInteractions = new Discord.EmbedBuilder()
        .setColor(Config.colors.mainServerColor)
        .setDescription(
          `## 📊 GESTION GLOBAL\n\n\n ➡️ ***Utilisez le sélecteur ci-dessous pour gérer le bot et accéder aux différentes interactions disponibles.***\n\n*__Liste des drapeaux :__ [Cliquez ici](https://emojipedia.org/fr/drapeaux)*`
        )

      const interactionGestionOfAllBotInteractions =
        new Discord.ActionRowBuilder().addComponents(
          new Discord.StringSelectMenuBuilder()
            .setCustomId(`gestionAllBot_Interactions`)
            .setPlaceholder("📌 Séléctionner une option...")
            .addOptions(
              {
                emoji: "📌",
                label: "Séléctionner une option",
                description: "...",
                value: "0",
                default: true,
              },
              {
                emoji: "📆",
                label: "Créer un événement",
                description: "Créer un nouvel événement !",
                value: "7",
              },
              {
                emoji: "⚙️",
                label: "Gestion des événements",
                description: "Gérer vos événements (Fermer, supprimer, etc...)",
                value: "8",
              },
              {
                emoji: "📨",
                label: "Demande d'Adhésion",
                description: "Visualisez les demandes d'adhésion à l'entrylist",
                value: "10",
              },
              {
                emoji: "💬",
                label: "Ajouter un salon",
                description: "Ajouter des salons pour vos événements",
                value: "1",
              },
              {
                emoji: "🗯️",
                label: "Gestion des salons",
                description: "Gérer vos salons (supprimer, modifier)",
                value: "2",
              },
              {
                emoji: "🚦",
                label: "Ajouter un preset",
                description: "Créer vos propres présets",
                value: "3",
              },
              {
                emoji: "🎨",
                label: "Gestion des presets",
                description: "Gérer les différents presets d'évenement",
                value: "4",
              },
              {
                emoji: "🏁",
                label: "Ajouter un circuit",
                description:
                  "Ajouter des circuits (Drapeau, Pays, Circuit, Longueur, Image)",
                value: "5",
              },
              {
                emoji: "🚧",
                label: "Gestion des circuits",
                description: "Gérer vos circuits (Activer ou Désactiver)",
                value: "6",
              },
              {
                emoji: "🔨",
                label: "Règlement",
                description: "Modifier le règlement de course",
                value: "9",
              }
            )
        )

      await bot.channels.cache.get(Config.channels.gestionChannel).send({
        embeds: [embedGestionOfAllBotInteractions],
        components: [interactionGestionOfAllBotInteractions],
      })

      const embedEntrylist = new Discord.EmbedBuilder()
        .setColor(Config.colors.mainServerColor)
        .setDescription(
          `## 📝 Entrylist\n\n- Choisissez un numéro libre dans [Entrylist](https://les-simracers.fr/entrylist/)\n- Replissez le fomulaire en cliquant sur le bouton en dessous \`📨\`\n- Votre demande d'adhésion à l'entrylist sera traiter dans les plus bref délais.\n\n*Merci de bien suivre les étapes du formulaire et de les complétées !*\n\n-# Chaque personne qui quitte le serveur sera retirée de l'entrylist !`
        )

      const actionEntrylistFormStart =
        new Discord.ActionRowBuilder().addComponents(
          new Discord.ButtonBuilder()
            .setCustomId(`startEntrylistRegistration`)
            .setEmoji("📨")
            .setDisabled(false)
            .setStyle(Discord.ButtonStyle.Secondary)
        )

      await bot.channels.cache.get("1323999152731979816").send({
        embeds: [embedEntrylist],
        components: [actionEntrylistFormStart],
      })
    }
  }
}
