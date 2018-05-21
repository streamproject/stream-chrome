import { ParamRegistry, Type } from 'ts-express-decorators'
import DecodedParamsFilter from '../filters/DecodedParamsFilter'

export default function DecodedParams(expression?: string | any, useType?: any): Function {
  return <T>(target: Type<T>, propertyKey: string | symbol, parameterIndex: number): void => {
    if (typeof parameterIndex === 'number') {
      ParamRegistry.useFilter(DecodedParamsFilter, {
        target,
        propertyKey,
        parameterIndex,
        expression,
        useType,
      })
    }
  }
}
