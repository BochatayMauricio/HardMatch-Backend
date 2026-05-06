import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

export const sendPriceDropEmail = async (userEmail: string, productName: string, newPrice: number, productUrl: string) => {
    try {
        const mailOptions = {
            from: `"HardMatch Alertas" <${process.env.EMAIL_USER}>`,
            to: userEmail,
            subject: '🚨 ¡Bajó de precio un producto en tus Favoritos!',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 10px;">
                    <h2 style="color: #3b82f6; text-align: center;">¡Tenemos buenas noticias! 🎉</h2>
                    <p style="font-size: 16px; color: #333;">El producto <strong>${productName}</strong> que estabas siguiendo acaba de bajar de precio.</p>
                    
                    <div style="background-color: #f8fafc; padding: 15px; border-radius: 8px; margin: 20px 0; text-align: center;">
                        <span style="font-size: 14px; color: #64748b;">Nuevo precio detectado:</span><br>
                        <strong style="font-size: 24px; color: #10b981;">$ ${newPrice.toLocaleString('es-AR')}</strong>
                    </div>
                    
                    <div style="text-align: center; margin-top: 30px;">
                        <a href="${productUrl}" style="background-color: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold;">Ver oferta en HardMatch</a>
                    </div>
                </div>
            `
        };

        const info = await transporter.sendMail(mailOptions);
        console.log(`[Mailer] ✅ Correo enviado a ${userEmail}`);
        return true;
    } catch (error) {
        console.error(`[Mailer] ❌ Error enviando correo a ${userEmail}:`, error);
        return false;
    }
};