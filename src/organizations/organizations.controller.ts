import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { OrganizationsService } from './organizations.service';
import { CreateOrganizationDto } from './dto/create-organization.dto';
import { UpdateOrganizationDto } from './dto/update-organization.dto';
import { JwtAuthGuard } from 'src/auth/auth.gaurd';
import { CurrentUser } from 'src/auth/auth.decorator';
import { ValidateDTO } from 'src/common/pipe/validation.pipe';
import type { User } from 'generated/prisma/client';

@Controller('organizations')
@UseGuards(JwtAuthGuard)
export class OrganizationsController {
  constructor(private readonly organizationsService: OrganizationsService) {}

  @Post()
  create(
    @CurrentUser() user: User,
    @Body(new ValidateDTO()) dto: CreateOrganizationDto,
  ) {
    return this.organizationsService.create(dto, user);
  }

  // Organization endpoints are user based cuz they're whats used to build the user workspace must be userscoped

  // this particular endpoint is used to build all org in a workspace would requie current user guard return the membership table of the user
  @Get()
  findAll() {
    return this.organizationsService.findAll();
  }

  // would require current org guard,
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.organizationsService.findOne(+id);
  }

  // would require current org guard, and permission org.update
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateOrganizationDto: UpdateOrganizationDto,
  ) {
    return this.organizationsService.update(+id, updateOrganizationDto);
  }

  // would require current org guard, permission org.delete
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.organizationsService.remove(+id);
  }
}
