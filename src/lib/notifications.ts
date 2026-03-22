// WhatsApp notification utilities
import twilio from "twilio";

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const fromNumber = process.env.TWILIO_PHONE_NUMBER || "whatsapp:+14155238886";

const client = accountSid && authToken ? twilio(accountSid, authToken) : null;

const stageEmojis: Record<string, string> = {
  onboarding: "👋",
  profile: "👤",
  strategy: "🎯",
  documentation: "📄",
  translations: "🌐",
  apostille: "📋",
  review: "⚖️",
  application: "📝",
  follow_up: "📞",
  approval: "✅",
  post_approval: "🎉",
  relocation: "✈️",
};

const statusEmojis: Record<string, string> = {
  pending: "⏳",
  in_progress: "🚀",
  awaiting_client: "⚠️",
  in_review: "🔍",
  blocked: "🚫",
  completed: "✅",
};

export async function sendStageNotification({
  clientName,
  clientPhone,
  stageName,
  stageType,
  newStatus,
  progress,
}: {
  clientName: string;
  clientPhone: string;
  stageName: string;
  stageType: string;
  newStatus: string;
  progress?: number;
}) {
  if (!client) {
    console.log("Twilio not configured, skipping notification");
    return;
  }

  const stageEmoji = stageEmojis[stageType] || "📌";
  const statusEmoji = statusEmojis[newStatus] || "📋";

  const statusMessages: Record<string, string> = {
    in_progress: "foi iniciada!",
    awaiting_client: "precisa da sua atenção. Acesse o portal para mais detalhes.",
    in_review: "está sendo revisada pela nossa equipe.",
    blocked: "está temporariamente pausada. Entraremos em contato em breve.",
    completed: "foi concluída! 🎉",
  };

  const message = `${stageEmoji} *${stageName}*

Olá, ${clientName.split(" ")[0]}!

${statusEmoji} Sua etapa ${statusMessages[newStatus] || "foi atualizada."}

${progress !== undefined && progress > 0 ? `📊 Progresso: ${progress}%\n\n` : ""}.Accessible via seu portal NomadWay.

_Dúvidas? Responda esta mensagem._`;

  try {
    // Format phone number
    const formattedPhone = clientPhone.startsWith("whatsapp:")
      ? clientPhone
      : `whatsapp:${clientPhone.replace(/\D/g, "")}`;

    const result = await client.messages.create({
      body: message,
      from: fromNumber,
      to: formattedPhone,
    });

    console.log("WhatsApp notification sent:", result.sid);
    return result;
  } catch (error) {
    console.error("Error sending WhatsApp notification:", error);
    throw error;
  }
}

export async function sendDocumentRequestNotification({
  clientName,
  clientPhone,
  documentName,
  stageName,
}: {
  clientName: string;
  clientPhone: string;
  documentName: string;
  stageName: string;
}) {
  if (!client) {
    console.log("Twilio not configured, skipping notification");
    return;
  }

  const message = `📄 *Novo Documento Solicitado*

Olá, ${clientName.split(" ")[0]}!

Precisamos do seguinte documento:
*${documentName}*

Etapa: ${stageName}

📎 Acesse seu portal para enviar:
https://nomadway.com.br/portal

_Responda esta mensagem se tiver dúvidas._`;

  try {
    const formattedPhone = clientPhone.startsWith("whatsapp:")
      ? clientPhone
      : `whatsapp:${clientPhone.replace(/\D/g, "")}`;

    const result = await client.messages.create({
      body: message,
      from: fromNumber,
      to: formattedPhone,
    });

    console.log("Document request notification sent:", result.sid);
    return result;
  } catch (error) {
    console.error("Error sending document request notification:", error);
    throw error;
  }
}

export async function sendNewMessageNotification({
  clientName,
  clientPhone,
  stageName,
  messagePreview,
}: {
  clientName: string;
  clientPhone: string;
  stageName: string;
  messagePreview: string;
}) {
  if (!client) {
    console.log("Twilio not configured, skipping notification");
    return;
  }

  const message = `💬 *Nova Mensagem*

${clientName.split(" ")[0]}, você tem uma nova mensagem!

Etapa: ${stageName}
"${messagePreview.substring(0, 50)}${messagePreview.length > 50 ? "..." : ""}"

💬 Acesse seu portal para responder:
https://nomadway.com.br/portal`;

  try {
    const formattedPhone = clientPhone.startsWith("whatsapp:")
      ? clientPhone
      : `whatsapp:${clientPhone.replace(/\D/g, "")}`;

    const result = await client.messages.create({
      body: message,
      from: fromNumber,
      to: formattedPhone,
    });

    console.log("Message notification sent:", result.sid);
    return result;
  } catch (error) {
    console.error("Error sending message notification:", error);
    throw error;
  }
}