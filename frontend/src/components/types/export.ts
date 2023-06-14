import { RouterEnum } from "@/types/exports"
import { Dispatch, SetStateAction } from "react"

export type RouterSetter = {
    setRouter: Dispatch<SetStateAction<RouterEnum>>
} 
