import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { writeFileSync, mkdirSync } from 'fs';
import { join } from 'path';
import * as yaml from 'js-yaml';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const logger = new Logger('Bootstrap');

  // Libera o frontend (Vue) a consumir a API e a ler o token renovado (ADR-017)
  app.enableCors({
    origin: true,
    credentials: true,
    exposedHeaders: ['X-Renewed-Token'],
  });

  // Validação global das requisições
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Padroniza o corpo das respostas de erro
  app.useGlobalFilters(new HttpExceptionFilter());

  // ── Documentação Swagger ───────────────────────
  const config = new DocumentBuilder()
    .setTitle('API — Software de Processo Avaliativo')
    .setDescription(
      'API REST para condução de processos avaliativos (avaliador e avaliado). ' +
        'Autenticação via JWT no cabeçalho Authorization: Bearer <token>.',
    )
    .setVersion('1.0.0')
    .addBearerAuth()
    .addTag('Autenticação')
    .addTag('Usuários')
    .addTag('Perguntas')
    .addTag('Processos')
    .addTag('Tentativas')
    .addTag('Respostas')
    .addTag('Notificações')
    .build();

  const document = SwaggerModule.createDocument(app, config);

  // Gera o arquivo da especificação na pasta de recursos
  const resourcesDir = join(process.cwd(), 'resources');
  mkdirSync(resourcesDir, { recursive: true });
  writeFileSync(
    join(resourcesDir, 'swagger.json'),
    JSON.stringify(document, null, 2),
    'utf8',
  );
  writeFileSync(
    join(resourcesDir, 'swagger.yaml'),
    yaml.dump(document),
    'utf8',
  );
  logger.log('Especificação Swagger gerada em resources/swagger.{json,yaml}');

  // Endpoint que renderiza o Swagger
  SwaggerModule.setup('docs', app, document, {
    swaggerOptions: { persistAuthorization: true },
  });

  const port = process.env.PORT ?? 3000;
  await app.listen(port);
  logger.log(`API disponível em http://localhost:${port}`);
  logger.log(`Swagger UI em http://localhost:${port}/docs`);
}

bootstrap();
