// backend/src/services/emailTemplates.js

const colors = {
  primary: '#145C63',
  light: '#F3F4F6',
  dark: '#1C1C1E',
  white: '#ffffff',
  accent: '#C1C1C1',
};

const baseLayout = (content) => `
  <table width="100%" cellpadding="0" cellspacing="0" style="background:${colors.light};padding:40px 0;font-family:Poppins,Arial,sans-serif">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background:${colors.white};border-radius:8px;padding:40px">
          <tr>
            <td align="center" style="font-size:28px;font-weight:700;color:${colors.primary}">
              OdontApp
            </td>
          </tr>
          <tr><td style="height:8px"></td></tr>
          <tr>
            <td align="center" style="font-size:14px;color:${colors.accent}">
              Plataforma de gestión odontológica
            </td>
          </tr>
          <tr><td style="height:32px"></td></tr>
          ${content}
          <tr><td style="height:32px"></td></tr>
          <tr>
            <td align="center" style="font-size:12px;color:${colors.dark};opacity:.6">
              © ${new Date().getFullYear()} OdontApp — Todos los derechos reservados
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
`;

export const templates = {
  confirmEmail: ({ name, link }) => baseLayout(`
    <tr>
      <td style="font-size:18px;color:${colors.dark};line-height:1.4">
        Hola <strong>${name}</strong>,
      </td>
    </tr>
    <tr><td style="height:12px"></td></tr>
    <tr>
      <td style="font-size:15px;color:${colors.dark};line-height:1.5">
        ¡Gracias por registrarte en OdontApp!<br />
        Para activar tu cuenta y empezar a utilizar la plataforma, por favor verifica tu correo electrónico haciendo clic en el siguiente botón:
      </td>
    </tr>
    <tr><td style="height:24px"></td></tr>
    <tr>
      <td align="center">
        <a href="${link}" style="
          background:${colors.primary};
          color:${colors.white};
          padding:12px 28px;
          border-radius:6px;
          text-decoration:none;
          font-weight:600;
          font-size:16px;
        ">Verificar mi correo</a>
      </td>
    </tr>
    <tr><td style="height:24px"></td></tr>
    <tr>
      <td style="font-size:13px;color:${colors.accent};text-align:center">
        Si no solicitaste este registro, puedes ignorar este mensaje.
      </td>
    </tr>
  `),

  resetPassword: ({ name, link }) => baseLayout(`
    <tr>
      <td style="font-size:18px;color:${colors.dark};line-height:1.4">
        Hola <strong>${name}</strong>,
      </td>
    </tr>
    <tr><td style="height:12px"></td></tr>
    <tr>
      <td style="font-size:15px;color:${colors.dark};line-height:1.5">
        Recibimos una solicitud para restablecer tu contraseña.<br />
        Si fuiste tú, haz clic en el botón de abajo. Si no, puedes ignorar este mensaje.
      </td>
    </tr>
    <tr><td style="height:24px"></td></tr>
    <tr>
      <td align="center">
        <a href="${link}" style="
          background:${colors.primary};
          color:${colors.white};
          padding:12px 28px;
          border-radius:6px;
          text-decoration:none;
          font-weight:600;
          font-size:16px;
        ">Restablecer contraseña</a>
      </td>
    </tr>
    <tr><td style="height:24px"></td></tr>
    <tr>
      <td style="font-size:13px;color:${colors.accent};text-align:center">
        Este enlace expira en 1 hora.
      </td>
    </tr>
  `),
};

export const renderTemplate = (tpl, vars) => {
  if (!templates[tpl]) throw new Error(`Plantilla ${tpl} inexistente`);
  return templates[tpl](vars);
};
