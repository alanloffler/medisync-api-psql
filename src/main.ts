import * as cookieParser from "cookie-parser";
import { NestFactory } from "@nestjs/core";
import { ValidationPipe } from "@nestjs/common";
import { AppModule } from "./app.module";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.use(cookieParser());

  app.enableCors({
    allowHeaders: ["Content-Type", "Authorization", "x-lang"],
    credentials: true,
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
    origin: [process.env.FRONTEND_URL?.toString()],
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  await app.listen(process.env.PORT ?? 3000);
}

void bootstrap();
