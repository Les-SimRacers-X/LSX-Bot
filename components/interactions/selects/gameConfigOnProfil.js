const { EmbedBuilder } = require("discord.js")
const { Config } = require("../../context/config")
const {
  fetchUserProfilByIdQuery,
} = require("../../context/data/data-users/queries")
const { emoteComposer } = require("../../context/utils/utils")
const {
  interactionOnProfil,
} = require("../../modules/module-licence/interactionOnProfil")
const { errorHandler } = require("../../context/utils/errorHandling")
const {
  licenceDisplay,
} = require("../../modules/module-licence/licenceDisplay")

// Faire un component modifier une config, trouver un moyen simple de modifier une config

module.exports = {
  customId: "interactionOnProfil",
  async execute(interaction) {
    const [action, userId] = interaction.customId.split("_")
    const selectedValue = interaction.values[0]

    switch (selectedValue) {
      case "add": {
        const { embedEvolution, interactionEvolution } =
          licenceEvolutionComponent(1, userId)
        return interaction.update({
          embeds: [embedEvolution],
          components: [interactionEvolution],
          ephemeral: true,
        })
      }

      case "edit": {
        return
      }

      case "return": {
        const { driverProfil, interactions } = licenceDisplay(userId)
        return interaction.update({
          embeds: [driverProfil],
          components: [interactions],
          ephemeral: true,
        })
      }

      default: {
        try {
          const userInfos = await fetchUserProfilByIdQuery(userId)
          const selectedGame = Config.games.find(
            (game) =>
              game.value === selectedValue &&
              Object.prototype.hasOwnProperty.call(
                userInfos.gameConfig,
                game.value
              )
          )

          const data = userInfos.gameConfig[selectedGame.value]
          const platform = Config.platforms.find(
            (platform) => platform.value === data?.platform
          )

          const options = Config.games
            .filter((game) =>
              Object.prototype.hasOwnProperty.call(
                userInfos.gameConfig,
                game.value
              )
            )
            .map((game) => {
              const data = userInfos.gameConfig[game.value]
              return {
                emoji: game.emote,
                label: game.name,
                description: `[${data?.trigram}] - ${data?.name}`,
                value: game.value,
              }
            })

          options.unshift({
            emoji: { name: "✏️" },
            label: "Modifier",
            description:
              "Modifiez la configuration que vous avez sélectionnée.",
            value: "edit",
          })

          options.push({
            emoji: Config.emotes.previousArrow,
            label: "Retour en arrière",
            value: "return",
          })

          const displayGameConfig = new EmbedBuilder()
            .setColor(Config.colors.default)
            .setDescription(
              `### ${emoteComposer(selectedGame.emote)} ${
                selectedGame.name
              }\n- ${emoteComposer(platform.emote)} **Platforme :** ${
                platform.name
              }\n- 🧩 **UUID :** ${data.id}\n- 📃 **Pseudo :** ${
                data?.name
              }\n- 🏷️ **Trigramme :** ${data?.trigram}\n- #️⃣ **Numéro :** ${
                data?.number
              }`
            )
            .setFooter({
              text: "Cette configuration vous permet d'accéder à nos serveurs. Merci de ne pas la casser.",
            })

          const interactions = interactionOnProfil(
            userId,
            options,
            selectedValue
          )

          return interaction.update({
            embeds: [displayGameConfig],
            components: [interactions],
            ephemeral: true,
          })
        } catch (error) {
          await errorHandler(interaction, error)
        }
      }
    }
  },
}
