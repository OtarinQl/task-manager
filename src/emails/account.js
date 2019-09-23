const sgMail = require('@sendgrid/mail')
const sendGridAPI = process.env.SENDGRID_API_KEY || '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'

const welcomeEmail = (to, name)=>{
    sgMail.setApiKey(sendGridAPI)
    const email = {
        to,
        from: 'luisn0155@gmail.com',
        subject: 'Welcome to the NHK!',
        text: `Gracias por unirte a nuestro servicio, ${name}~ esperamos que sea de su agrado`
    }
    sgMail.send(email)
}

const goodbyeEmail = (to, name)=>{
    sgMail.setApiKey(sendGridAPI)
    const email = {
        to,
        from: 'luisn0155@gmail.com',
        subject: 'A DÓNDE CREES QUE VAS, PUTA',
        text: `¿En serio crees que puedes librarte de nosotros, ${name}? Sabemos dónde vives, sabandija, nos las vas a pagar.`
    }
    sgMail.send(email)
}

module.exports = {
    welcomeEmail,
    goodbyeEmail
}