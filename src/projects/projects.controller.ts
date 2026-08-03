import { Controller, Post, Req, UseGuards } from '@nestjs/common';
import { CurrentUser } from 'src/auth/auth.decorator';
import { JwtAuthGuard } from 'src/auth/auth.gaurd';
import { CurrentOrg } from 'src/organizations/org.decorator';
import { isOrgMemberGuard } from 'src/organizations/org.guard';

@Controller('projects')
// @UseGuards(JwtAuthGuard)
// @UseGuards(OrgGuard) // this way of using guard gave me an error, the request object didn't match
@UseGuards(JwtAuthGuard, isOrgMemberGuard)
export class ProjectsController {
  @Post()
  newProject(@CurrentUser() user, @CurrentOrg() org) {
    return {
      user,
      org,
    };
  }
}
