import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Inject,
  Injectable
} from '@nestjs/common';
import { PrismaService } from '../../prisma.service';

@Injectable()
export class OnlyAdminGuard implements CanActivate {
  constructor(@Inject(PrismaService) private readonly prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const userId = parseInt(request.user.id);

    const user = await this.prisma.user.findFirst({
      where: { id: userId }
    });

    if (!user.isAdmin) throw new ForbiddenException('No Rights');

    return user.isAdmin;
  }
}
