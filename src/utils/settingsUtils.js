import { getSettings } from "@/services/posService"
export const loadSettings = async()=>{
    try{
        const res = await getSettings();
        return res
    }catch(err){
        console.log(err)
    }
}