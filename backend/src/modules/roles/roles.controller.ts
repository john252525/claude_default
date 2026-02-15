import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags, ApiOperation } from '@nestjs/swagger';
import { RolesService } from './roles.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';

@ApiTags('Roles')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('roles')
export class RolesController {
  constructor(private rolesService: RolesService) {}

  @Get()
  @Roles('admin', 'director')
  @ApiOperation({ summary: 'Список ролей' })
  findAll() {
    return this.rolesService.findAll();
  }

  @Get('permissions')
  @Roles('admin')
  @ApiOperation({ summary: 'Список всех разрешений' })
  getPermissions() {
    return this.rolesService.getAllPermissions();
  }

  @Get(':id')
  @Roles('admin', 'director')
  @ApiOperation({ summary: 'Получить роль по ID' })
  findOne(@Param('id') id: string) {
    return this.rolesService.findOne(id);
  }
}
