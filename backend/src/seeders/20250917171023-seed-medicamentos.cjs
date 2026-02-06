"use strict";
module.exports = {
  async up(queryInterface, Sequelize) {
    const now = new Date();
    const { randomUUID } = require('crypto');


    await queryInterface.bulkInsert(
      "medicamentos",
      [
        {
          id: randomUUID(),
          nombreGenerico: "Ibuprofeno",
          formaFarmaceutica: "comprimidos",
          dosis: "400 mg",
          presentacion: "blíster x 10",
          createdAt: now,
          updatedAt: now,
        },
        {
          id: randomUUID(),
          nombreGenerico: "Ibuprofeno",
          formaFarmaceutica: "comprimidos",
          dosis: "600 mg",
          presentacion: "blíster x 10",
          createdAt: now,
          updatedAt: now,
        },
        {
          id: randomUUID(),
          nombreGenerico: "Paracetamol",
          formaFarmaceutica: "comprimidos",
          dosis: "500 mg",
          presentacion: "blíster x 10",
          createdAt: now,
          updatedAt: now,
        },
        {
          id: randomUUID(),
          nombreGenerico: "Amoxicilina",
          formaFarmaceutica: "cápsulas",
          dosis: "500 mg",
          presentacion: "blíster x 12",
          createdAt: now,
          updatedAt: now,
        },
        {
          id: randomUUID(),
          nombreGenerico: "Clindamicina",
          formaFarmaceutica: "cápsulas",
          dosis: "300 mg",
          presentacion: "blíster x 16",
          createdAt: now,
          updatedAt: now,
        },
        {
          id: randomUUID(),
          nombreGenerico: "Metronidazol",
          formaFarmaceutica: "comprimidos",
          dosis: "250 mg",
          presentacion: "blíster x 20",
          createdAt: now,
          updatedAt: now,
        },
        {
          id: randomUUID(),
          nombreGenerico: "Nistatina",
          formaFarmaceutica: "suspensión",
          dosis: "100.000 UI/mL",
          presentacion: "frasco x 120 mL",
          createdAt: now,
          updatedAt: now,
        },
        {
          id: randomUUID(),
          nombreGenerico: "Ketorolac",
          formaFarmaceutica: "comprimidos",
          dosis: "10 mg",
          presentacion: "blíster x 10",
          createdAt: now,
          updatedAt: now,
        },
        {
          id: randomUUID(),
          nombreGenerico: "Dexametasona",
          formaFarmaceutica: "gotas",
          dosis: "0.1%",
          presentacion: "frasco x 10 mL",
          createdAt: now,
          updatedAt: now,
        },
        {
          id: randomUUID(),
          nombreGenerico: "Benzocaína",
          formaFarmaceutica: "gel",
          dosis: "20%",
          presentacion: "tubo x 15 g",
          createdAt: now,
          updatedAt: now,
        },
        {
          id: randomUUID(),
          nombreGenerico: "Clorhexidina",
          formaFarmaceutica: "enjuague",
          dosis: "0.12%",
          presentacion: "frasco x 250 mL",
          createdAt: now,
          updatedAt: now,
        },
        {
          id: randomUUID(),
          nombreGenerico: "Lidocaína",
          formaFarmaceutica: "ampollas",
          dosis: "2%",
          presentacion: "caja x 50 ampollas",
          createdAt: now,
          updatedAt: now,
        },
      ],
      {}
    );
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete("medicamentos", null, {});
  },
};
