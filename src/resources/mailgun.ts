import configs from 'configs';
import formData from 'form-data';
import Mailgun from 'mailgun.js';
import { logger } from 'utils/logger';

const mailGunConnect = () => {
    try {
        const clientOptions = {
            username: configs.mailgun.username, key: configs.mailgun.secretKey, url: "https://api.eu.mailgun.net"
        }
        const mailgun = new Mailgun(formData);

        const global = globalThis as any

        global.mailgunClient = mailgun.client(clientOptions);
        logger.info(`Mailgun started`);
    }
    catch (error) {
        console.log(error)
        process.exit()
    }
}

export default mailGunConnect