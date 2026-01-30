import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { Usuario } from '../modules/Usuarios/models/index.js';

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_CALLBACK_URL,
    },
    async (_access, _refresh, profile, done) => {
      try {
        const email = profile.emails[0].value;
        const avatar = profile.photos[0]?.value || null;
        console.log('📦 GOOGLE_CALLBACK_URL usado:', process.env.GOOGLE_CALLBACK_URL);
        // ‼️ 1) Si ya existe el usuario, lo reutilizamos
        let user = await Usuario.findOne({ where: { email } });

        // ‼️ 2) Si no existe lo creamos con Rol “Recepcionista” (id 4) o el que quieras
        if (!user) {
          user = await Usuario.create({
            nombre: profile.name.givenName || 'Google',
            apellido: profile.name.familyName || 'User',
            email,
            password: null,
            activo: true,
            avatarUrl: avatar,
            RolId: 5,
            proveedor: 'google',
            oauthId: profile.id,
          });
        } else {
          // Si existe pero no tiene proveedor/oauthId, lo actualizamos
          if (!user.proveedor || !user.oauthId) {
            await user.update({
              proveedor: 'google',
              oauthId: profile.id,
              avatarUrl: avatar || user.avatarUrl,
            });
          }
        }

        return done(null, user);
      } catch (err) {
        done(err, null);
      }
    }
  )
);

export default passport;
