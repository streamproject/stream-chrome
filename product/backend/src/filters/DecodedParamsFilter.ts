import { Filter, IFilter, ParseService } from 'ts-express-decorators'

@Filter()
export default class DecodedParamsFilter implements IFilter {

    constructor(private parseService: ParseService) {
    }

    public transform(expression: string, request: any, response: any) {
        return this.parseService.eval(expression, request.decoded)
    }

}
