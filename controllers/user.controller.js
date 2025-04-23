const User = require('../models/user.model');
const { hash, compare } = require('../utils/hashPassword');
const { generateCode } = require('../utils/generateCode');
const { signToken } = require('../utils/jwt');

// REGISTRO
exports.register = async (req, res) => {
  const { email, password } = req.body;

  try {
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      if (existingUser.isValidated) {
        return res.status(409).json({ error: 'Email ya registrado y validado' });
      }

      // Usuario no validado: actualizamos
      existingUser.password = await hash(password);
      const code = generateCode();
      existingUser.emailCode = code;
      existingUser.emailAttempts = 0;
      await existingUser.save();

      const token = signToken({ id: existingUser._id, email: existingUser.email });

      console.log(`✅ Usuario actualizado:
  Email: ${existingUser.email}
  Código de verificación: ${code}
  Role: ${existingUser.role}
  Validado: ${existingUser.isValidated}
`);

      return res.status(200).json({
        message: 'Usuario actualizado correctamente',
        user: {
          email: existingUser.email,
          role: existingUser.role,
          status: existingUser.isValidated,
          code: existingUser.emailCode
        },
        token
      });
    }

    // Usuario nuevo
    const hashedPassword = await hash(password);
    const code = generateCode();

    const newUser = await User.create({
      email,
      password: hashedPassword,
      emailCode: code,
      emailAttempts: 0,
      isValidated: false,
      role: 'user'
    });

    const token = signToken({ id: newUser._id, email: newUser.email });

    console.log(`✅ Usuario creado:
    Email: ${newUser.email}
    Código de verificación: ${code}
    Role: ${newUser.role}
    Validado: ${newUser.isValidated}
`);

  return res.status(201).send(
    JSON.stringify({
      message: 'Usuario creado correctamente',
      user: {
        email: newUser.email,
        role: newUser.role,
        status: newUser.isValidated,
        code: newUser.emailCode
      },
      token
    }, null, 2)
  );
  } catch (err) {
    console.error('Error en registro:', err);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

// VALIDACIÓN DE EMAIL
exports.validateEmail = async (req, res) => {
  const { code } = req.body;
  const userId = req.user?.id;

  try {
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    if (user.isValidated) {
      return res.status(400).json({ error: 'El email ya está validado' });
    }

    if (user.emailCode === code) {
      user.isValidated = true;
      await user.save();
      return res.status(200).json({ message: '✅ Email validado correctamente' });
    } else {
      user.emailAttempts += 1;
      await user.save();
      return res.status(400).json({ error: '❌ Código incorrecto' });
    }
  } catch (err) {
    console.error('Error en validación de email:', err);
    res.status(500).json({ error: 'Error al validar el email' });
  }
};

exports.login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    if (!user.isValidated) {
      return res.status(403).json({ error: 'El email no ha sido validado' });
    }

    const passwordMatch = await compare(password, user.password);
    if (!passwordMatch) {
      return res.status(401).json({ error: 'Credenciales incorrectas' });
    }

    const token = signToken({ id: user._id, email: user.email });

    return res.status(200).send(
      JSON.stringify({
        message: 'Inicio de sesión exitoso',
        user: {
          email: user.email,
          role: user.role,
          status: user.isValidated
        },
        token
      }, null, 2) // <--- este "2" añade indentación
    );    
  } catch (err) {
    console.error('Error en login:', err);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

exports.updatePersonalData = async (req, res) => {
  const { nombre, apellidos, nif } = req.body;
  const userId = req.user.id;

  try {
    const user = await User.findByIdAndUpdate(
      userId,
      { nombre, apellidos, nif },
      { new: true }
    );

    if (!user) return res.status(404).json({ error: 'Usuario no encontrado' });

    res.status(200).json({
      message: '✅ Datos personales actualizados',
      user: {
        email: user.email,
        nombre: user.nombre,
        apellidos: user.apellidos,
        nif: user.nif
      }
    });
  } catch (err) {
    console.error('Error en onboarding personal:', err);
    res.status(500).json({ error: 'Error al actualizar los datos personales' });
  }
};

exports.updateCompanyData = async (req, res) => {
  const { nombre, cif, direccion, autonomo } = req.body;
  const userId = req.user.id;

  try {
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ error: 'Usuario no encontrado' });

    if (autonomo) {
      if (!user.nombre || !user.apellidos || !user.nif) {
        return res.status(400).json({ error: 'Datos personales incompletos para autónomo' });
      }

      user.empresa = {
        nombre: `${user.nombre} ${user.apellidos}`,
        cif: user.nif,
        direccion
      };
    } else {
      user.empresa = { nombre, cif, direccion };
    }

    await user.save();

    return res.status(200).json({
      message: '✅ Datos de la compañía actualizados',
      empresa: user.empresa
    });
  } catch (err) {
    console.error('Error actualizando datos de empresa:', err);
    res.status(500).json({ error: 'Error al actualizar los datos de la empresa' });
  }
};

exports.updateLogo = async (req, res) => {
  const userId = req.user.id;

  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No se ha subido ninguna imagen' });
    }

    const imagePath = `/uploads/${req.file.filename}`;

    const user = await User.findByIdAndUpdate(
      userId,
      { logo: imagePath },
      { new: true }
    );

    res.status(200).json({
      message: '✅ Logo actualizado correctamente',
      logo: user.logo
    });
  } catch (err) {
    console.error('Error al actualizar logo:', err);
    res.status(500).json({ error: 'Error al subir el logo' });
  }
};

exports.getUser = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) return res.status(404).json({ error: 'Usuario no encontrado' });

    res.status(200).json({ user });
  } catch (err) {
    console.error('Error al obtener usuario:', err);
    res.status(500).json({ error: 'Error al obtener los datos del usuario' });
  }
};

exports.deleteUser = async (req, res) => {
  const userId = req.user.id;
  const soft = req.query.soft !== 'false'; // por defecto es soft

  try {
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ error: 'Usuario no encontrado' });

    if (soft) {
      user.deleted = true;
      await user.save();
      return res.status(200).json({ message: '🗑️ Usuario marcado como eliminado (soft delete)' });
    } else {
      await user.deleteOne();
      return res.status(200).json({ message: '❌ Usuario eliminado permanentemente (hard delete)' });
    }
  } catch (err) {
    console.error('Error al eliminar usuario:', err);
    res.status(500).json({ error: 'Error al eliminar usuario' });
  }
};

exports.changePassword = async (req, res) => {
  const { oldPassword, newPassword } = req.body;
  const userId = req.user.id;

  try {
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ error: 'Usuario no encontrado' });

    const match = await compare(oldPassword, user.password);
    if (!match) return res.status(400).json({ error: 'Contraseña actual incorrecta' });

    user.password = await hash(newPassword);
    await user.save();

    res.status(200).json({ message: '🔐 Contraseña actualizada correctamente' });
  } catch (err) {
    console.error('Error al cambiar contraseña:', err);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

exports.forgotPassword = async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ error: 'Usuario no encontrado' });

    const code = generateCode();
    user.resetCode = code;
    user.resetAttempts = 0;
    await user.save();

    const { sendVerificationEmail } = require('../utils/emailService');

    await sendVerificationEmail(email, code);

    res.status(200).json({ message: '📩 Código enviado al correo' });
  } catch (err) {
    console.error('Error enviando código de recuperación:', err);
    res.status(500).json({ error: 'Error interno' });
  }
};

exports.resetPassword = async (req, res) => {
  const { email, code, newPassword } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ error: 'Usuario no encontrado' });

    console.log('🛠️ Código recibido:', code);
    console.log('🛠️ Código guardado:', user.resetCode);

    if (String(user.resetCode).trim() !== String(code).trim()) {
      console.log('❌ Código incorrecto. Esperado:', user.resetCode, 'Recibido:', code);
      user.resetAttempts = (user.resetAttempts || 0) + 1;
      await user.save();
      return res.status(400).json({ error: 'Código incorrecto' });
    }    

    user.password = await hash(newPassword);
    user.resetCode = null;
    await user.save();

    res.status(200).json({ message: '🔐 Contraseña restablecida correctamente' });
  } catch (err) {
    console.error('Error al restablecer contraseña:', err);
    res.status(500).json({ error: 'Error interno' });
  }
};

exports.inviteGuest = async (req, res) => {
  const { email } = req.body;
  const userId = req.user.id;

  try {
    const owner = await User.findById(userId);
    if (!owner || !owner.empresa) {
      return res.status(400).json({ error: 'Debes tener una empresa para invitar' });
    }

    const code = generateCode();
    const guest = await User.create({
      email,
      password: await hash(generateCode()), // puede ser temporal
      role: 'guest',
      isValidated: false,
      emailCode: code,
      emailAttempts: 0,
      empresa: owner.empresa,
    });

    await sendEmail(email, 'Invitación a plataforma', `Código de acceso: ${code}`);

    res.status(201).json({ message: '👤 Invitado creado e invitación enviada', guestId: guest._id });
  } catch (err) {
    console.error('Error invitando guest:', err);
    res.status(500).json({ error: 'Error interno' });
  }
};