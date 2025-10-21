import { NextApiRequest, NextApiResponse } from "next";
import { Twilio } from "twilio";
import { handleIncomingMessage } from "../../modules/whatsapp/services/flowEngine";

const client = new Twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Parse urlencoded body
  const body = req.body;
  const from = body.From;
  const messageBody = body.Body;
  const name = body.ProfileName;

  // Chama o flowEngine
  const response = await handleIncomingMessage(from.replace("whatsapp:", ""), messageBody, name);

  try {
    await client.messages.create({
      from: "whatsapp:" + process.env.TWILIO_SANDBOX_NUMBER,
      to: from,
      body: response.reply,
    });
    res.status(200).send("OK");
  } catch (err) {
    console.error(err);
    res.status(500).send("Erro ao enviar mensagem");
  }
}
