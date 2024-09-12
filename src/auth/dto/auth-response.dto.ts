import { ApiProperty } from '@nestjs/swagger';

export class AuthResponseDto {
  @ApiProperty({
    example:
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTYwNTU5NDYyfQ.SkWixJYYN5w5hEXAMPLE',
    description: 'JWT token for authenticated user.',
  })
  access_token: string;
}
