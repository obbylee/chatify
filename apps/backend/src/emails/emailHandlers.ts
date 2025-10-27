import { resendClient, sender } from "../lib/resend";
import { createWelcomeEmailTemplate } from "./emailTemplate";

export const sendWelcomeEmail = async (email: string, name: string, clientURL: string) => {
  try {
    const { data, error } = await resendClient.emails.send({
      from: `${sender.name} <${sender.email}>`,
      to: email,
      subject: "Welcome to Chatify!",
      html: createWelcomeEmailTemplate(name, clientURL),
    });

    console.log("Welcome Email sent successfully", data);
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error("Failed to send welcome email:", error.message);
      throw new Error("Email failed to send: " + error.message);
    } else {
      console.error("Failed to send welcome email:", error);
      throw new Error("Email failed to send");
    }
  }
};
