import { RouterEnum } from "@/types/exports"
import { Dispatch, SetStateAction } from "react"

export type Router = {
    Router?: RouterEnum
    setRouter: Dispatch<SetStateAction<RouterEnum>>
} 
