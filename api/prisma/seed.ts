import { PrismaClient, Perfil } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const nome = process.env.ADMIN_NAME ?? 'Administrador';
  const email = process.env.ADMIN_EMAIL ?? 'admin@avaliacao.local';
  const senha = process.env.ADMIN_PASSWORD ?? 'Admin@123';

  const existente = await prisma.usuario.findUnique({ where: { email } });
  if (existente) {
    console.log(`Usuário administrador já existe: ${email}`);
    return;
  }

  const senhaHash = await bcrypt.hash(senha, 10);
  await prisma.usuario.create({
    data: { nome, email, senhaHash, perfil: Perfil.ADMIN },
  });

  console.log('Usuário administrador criado com sucesso:');
  console.log(`  e-mail: ${email}`);
  console.log(`  senha:  ${senha}`);
  console.log('Altere a senha após o primeiro acesso.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
