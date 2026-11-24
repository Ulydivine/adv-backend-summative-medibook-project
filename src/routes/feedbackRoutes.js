
const express = require('express');
const path = require('path');

const router = express.Router();

router.get('/', (req, res) => {
    const language = req.query.lang;
    let locale;
    let dateLocale;

    if (language === 'fr') {
        locale = require('../../locales/fr.json');
        dateLocale = 'fr-FR';
    } else {
        locale = require('../../locales/en.json');
        dateLocale = 'en-GB';
    }

    const today = new Intl.DateTimeFormat(dateLocale, {
        dateStyle: 'full'
    }).format(new Date());

    const questions = locale.questions.map((question, index) => `
        <div>
            <label for="question${index + 1}">
                ${index + 1}. ${question}
            </label>
            <br>
            <textarea
                id="question${index + 1}"
                name="question${index + 1}"
                rows="4"
                required
            ></textarea>
        </div>
        <br>
    `).join('');

    res.send(`
        <!DOCTYPE html>
        <html lang="${dateLocale}">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>${locale.title}</title>
        </head>
        <body>
            <h1>${locale.title}</h1>
            <p>${locale.instructions}</p>
            <p>${today}</p>

            <form>
                ${questions}
            </form>
        </body>
        </html>
    `);
});

module.exports = router;
