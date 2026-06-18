import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppSetting } from '../settings/entities/app-setting.entity';
import { User } from '../users/entities/user.entity';
import { InstallerController } from './installer.controller';
import { InstallerService } from './installer.service';

@Module({
  imports: [TypeOrmModule.forFeature([AppSetting, User])],
  controllers: [InstallerController],
  providers: [InstallerService],
})
export class InstallerModule {}
