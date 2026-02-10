import * as z from "zod"

const nullishToUndefined = (val: unknown) => {
    if (val === "" ||val === null || val === undefined) {
        return undefined
    }
    return val
}

export const zDate = () =>
    z.preprocess(
        (val) => {
            if (val === null || val === undefined) return undefined

            if (typeof val === 'string') {
                if (val.trim() === '') return undefined
                return val.replace(/-/g, '/')
            }

            if (val instanceof Date) {
                const year = val.getFullYear()
                const month = String(val.getMonth() + 1).padStart(2, '0')
                const day = String(val.getDate()).padStart(2, '0')
                return `${year}/${month}/${day}`
            }

            return val
        },
        z
            .string()
            .regex(/^\d{4}\/\d{2}\/\d{2}$/)
            .optional()
    )

export const zNumber = () =>
    z.preprocess(
        nullishToUndefined,
        z.coerce.number().optional()
    )

export const zString = () =>
    z.preprocess(
        nullishToUndefined,
        z.string().optional()
    )