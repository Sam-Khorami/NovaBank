import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from "@nestjs/common";
import { map } from "rxjs";

@Injectable()
export class ResponseFormaterInterceptor implements NestInterceptor {

    intercept (context: ExecutionContext, next: CallHandler) {

        return next.handle().pipe(

            map((data) => {

                return { success: true, data }

            })

        )

    }

}