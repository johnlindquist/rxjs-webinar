const observer = {
  next: value => {
    console.log(value)
  },
  complete: () => {
    console.log("done")
  },
  error: err => {
    console.log(err)
  }
}

const create = subscribe => ({
  subscribe: ({ next, complete, error }) => {
    const unsubscribe = subscribe({
      next,
      complete: () => {
        try {
          complete()
          unsubscribe()
        } catch (err) {
          console.log(error)
          error(err)
        }
      },
      error
    })

    return unsubscribe
  },
  pipe(operator) {
    return operator(this)
  }
})

const click = create(({ next, complete, error }) => {
  console.log(`click`, { next, complete, error })
  document.addEventListener("click", next)

  return () => document.removeEventListener("click", next)
})

const error = create(({ next, complete, error }) => {
  throw new Error()
})

const switchMap = to => from => {
  return create(({ next, complete, error }) => {
    console.log(`switchMap`, { next, complete, error })
    return from.subscribe({
      next: value => {
        try {
          return to.subscribe({
            next,
            complete,
            error
          })
        } catch (err) {
          error(err)
        }
      },
      complete,
      error
    })
  })
}

const catchError = fn => from => {
  return create(({ next, complete, error }) => {
    return from.subscribe({
      next,
      complete,
      error: err => {
        fn(err).subscribe({
          next,
          complete,
          error
        })
      }
    })
  })
}

const of = value =>
  create(({ next, complete, error }) => {
    next(value)
    complete()
  })

console.log({ observer })
const unsubClick = click
  .pipe(switchMap(error))
  .pipe(catchError(err => of("Hi")))
  .subscribe(observer)

// unsubClick()
