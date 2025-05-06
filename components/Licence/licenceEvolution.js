const { ActionRowBuilder, StringSelectMenuBuilder } = require("discord.js")
const { fetchUserProfilByIdQuery } = require("../../utils/sql/users/queries")

async function licenceEvolutionComponent(currentStep, userId, gameSelected) {
  const users = await fetchUserProfilByIdQuery(userId)
  const embedEvolution = new EmbedBuilder().setColor(Config.colors.default)
    .setDescription(`### 🪪 Finaliser votre inscription\n
      \`\`\`json
      ${users.gameConfig}
      \`\`\``)

  const interactionEvolution = new ActionRowBuilder().addComponents(
    new StringSelectMenuBuilder()
      .setCustomId(`menuLicenceSteps_${currentStep}_${gameSelected}_${userId}`)
      .setPlaceholder("📌 Sélectionner une option...")
      .addOptions(
        {
          emoji: { name: "🎮" },
          label: "Jeux",
          description: "Ajouter votre jeu !",
          value: "1",
        },
        {
          emoji: { name: "🧰" },
          label: "Platformes",
          description: "Sélectionnez une platforme !",
          value: "2",
        },
        {
          emoji: { name: "🏷️" },
          label: "Pseudo et numéro",
          description:
            "Entrez votre pseudo et le numéro que vous avez choisi !",
          value: "3",
        }
      )
  )

  return {
    embedEvolution,
    interactionEvolution,
  }
}

module.exports = {
  licenceEvolutionComponent,
}
