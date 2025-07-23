import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { Usuario, Rol } from '../modules/Usuarios/models/index.js';

passport.use(
  new GoogleStrategy(
    {
      clientID:     process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL:  process.env.GOOGLE_CALLBACK_URL,
    },
    async (_access, _refresh, profile, done) => {
      try {
        const email = profile.emails[0].value;
        const avatar = profile.photos[0]?.value || null;

        // ‼️ 1) Si ya existe el usuario, lo reutilizamos
        let user = await Usuario.findOne({ where: { email } });

        // ‼️ 2) Si no existe lo creamos con Rol “Recepcionista” (id 4) o el que quieras
        if (!user) {
          user = await Usuario.create({
            nombre:    profile.name.givenName  || 'Google',
            apellido:  profile.name.familyName || 'User',
            email,
            password:  null,
            activo:    true,
            avatarUrl: avatar,
            RolId:     4,
            proveedor: 'google',
            oauthId:   profile.id,
          });
        }

        // Podrías guardar `proveedor: 'google'` si querés auditar
        return done(null, user);
      } catch (err) {
        done(err, null);
      }
    }
  )
);

export default passport;
