import { getTypeSystem, Context, ValidationError, Type } from '../../../src/core'
import { monadTypeTaskEitherAll, validate } from '../../../src/taskEither'
import { URI as TaskEitherURI, TaskEither } from 'fp-ts/lib/TaskEither'
import { Task } from 'fp-ts/lib/Task'
import { left, right } from 'fp-ts/lib/Either'
import { assertSuccess, assertFailure } from '../../helpers'

const t = getTypeSystem(monadTypeTaskEitherAll)

const signUpAPI = (n: number) => (context: Context, username: string): TaskEither<Array<ValidationError>, string> =>
  new TaskEither(
    new Task(
      () =>
        new Promise(res => {
          setTimeout(() => {
            if (username === 'taken') {
              res(left<Array<ValidationError>, string>([{ value: username, context }]))
            } else {
              res(right<Array<ValidationError>, string>(username))
            }
          }, n)
        })
    )
  )

export const Username = new Type<TaskEitherURI, any, string>(
  'Username',
  (v): v is string => t.string.is(v),
  (v, c) => monadTypeTaskEitherAll.chain(username => signUpAPI(100)(c, username), t.string.validate(v, c)),
  a => t.string.serialize(a)
)

describe('interface (async/all)', () => {
  it('should succeed validating a valid value', () => {
    const T = t.type(
      {
        username: Username,
        password: t.string
      },
      'SignUp'
    )
    return validate({ username: 'free', password: 'password' }, T)
      .run()
      .then(validation => assertSuccess(validation))
  })

  it('should fail validating an invalid value', () => {
    const T = t.type(
      {
        username: Username,
        password: t.string
      },
      'SignUp'
    )
    return validate({ username: 'taken', password: 'password' }, T)
      .run()
      .then(validation => assertFailure(validation, ['Invalid value "taken" supplied to : SignUp/username: Username']))
  })
})
