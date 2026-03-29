package io.linkard.backend.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

import java.util.List;
import java.util.Map;

@Service
@Slf4j
public class EmailService {

    private final RestClient restClient = RestClient.create("https://api.resend.com");

    @Value("${resend.api-key:}")
    private String apiKey;

    @Value("${resend.from:noreply@linkard-io.vercel.app}")
    private String fromAddress;

    public void sendContactEmail(String toEmail, String toName,
                                  String fromName, String fromEmail, String message) {
        if (apiKey == null || apiKey.isBlank()) {
            log.warn("RESEND_API_KEY not set — email not sent");
            return;
        }

        var body = Map.of(
                "from", fromAddress,
                "to", List.of(toEmail),
                "reply_to", fromEmail,
                "subject", "Nowa wiadomość od " + fromName + " przez Linkard",
                "html", buildHtml(toName, fromName, fromEmail, message)
        );

        try {
            restClient.post()
                    .uri("/emails")
                    .header(HttpHeaders.AUTHORIZATION, "Bearer " + apiKey)
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(body)
                    .retrieve()
                    .toBodilessEntity();
        } catch (Exception e) {
            log.error("Resend API error", e);
            throw new RuntimeException("Nie udało się wysłać wiadomości");
        }
    }

    private String buildHtml(String toName, String fromName, String fromEmail, String message) {
        String safeMessage = message.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;")
                .replace("\n", "<br/>");
        return """
                <div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:24px;">
                  <h2 style="margin-top:0;">Nowa wiadomość przez Linkard</h2>
                  <p><strong>Od:</strong> %s &lt;%s&gt;</p>
                  <p><strong>Do:</strong> %s</p>
                  <hr style="margin:16px 0;border:none;border-top:1px solid #eee;"/>
                  <p style="white-space:pre-wrap;">%s</p>
                  <hr style="margin:16px 0;border:none;border-top:1px solid #eee;"/>
                  <p style="color:#999;font-size:12px;">Wiadomość wysłana przez formularz kontaktowy na Linkard</p>
                </div>
                """.formatted(fromName, fromEmail, toName, safeMessage);
    }
}
