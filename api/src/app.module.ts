import {
  MiddlewareConsumer,
  Module,
  NestModule,
  RequestMethod,
} from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { AuthMiddleware } from './auth/auth.middleware';
import { UsersModule } from './users/users.module';
import { QuestionsModule } from './questions/questions.module';
import { ProcessesModule } from './processes/processes.module';
import { AttemptsModule } from './attempts/attempts.module';
import { AnswersModule } from './answers/answers.module';
import { ScoringModule } from './scoring/scoring.module';
import { NotificationsModule } from './notifications/notifications.module';
import { HealthController } from './health/health.controller';
import { RolesGuard } from './common/guards/roles.guard';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    AuthModule,
    UsersModule,
    QuestionsModule,
    ProcessesModule,
    AttemptsModule,
    AnswersModule,
    ScoringModule,
    NotificationsModule,
  ],
  controllers: [HealthController],
  providers: [
    // Autorização por perfil aplicada globalmente; só atua onde há @Roles
    { provide: APP_GUARD, useClass: RolesGuard },
  ],
})
export class AppModule implements NestModule {
  /**
   * Autenticação como middleware (requisito do projeto).
   * Aplicado a todas as rotas, exceto as públicas (login, refresh, docs, health).
   */
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(AuthMiddleware)
      .exclude(
        { path: 'auth/login', method: RequestMethod.POST },
        { path: 'auth/refresh', method: RequestMethod.POST },
        { path: 'health', method: RequestMethod.GET },
        { path: 'docs', method: RequestMethod.ALL },
        { path: 'docs/(.*)', method: RequestMethod.ALL },
        { path: 'docs-json', method: RequestMethod.ALL },
      )
      .forRoutes('*');
  }
}
