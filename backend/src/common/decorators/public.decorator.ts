import { SetMetadata } from '@nestjs/common';

export const IS_PUBLIC_KEY = 'isPublic';

/** Opts a route out of the global JWT guard (rule 20-rest-api: public is the marked exception). */
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);
