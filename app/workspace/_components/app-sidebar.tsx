/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/set-state-in-effect */
'use client'
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarGroupLabel,
    SidebarHeader,
    SidebarTrigger,
    useSidebar,
} from "@/components/ui/sidebar"
import { Skeleton } from "@/components/ui/skeleton"
import UserDetailContext from "@/context/UserDetailContext"
import { useAuth, UserButton } from "@clerk/nextjs"
import axios from "axios"
import { Loader2Icon, MessageCircle, Square, SquarePen } from "lucide-react"

import Image from "next/image"
import Link from "next/link"
import { useContext, useEffect, useState } from "react"



export function AppSidebar() {
    const [projectList, setProjectList] = useState<any[]>([])
    const [loading, setLoading] = useState(false)
    const { open } = useSidebar()
    const context = useContext(UserDetailContext)

    if (!context) {
        throw new Error("UserDetailContext not provided")
    }

    const { userDetail, setUserDetail } = context
    const { has } = useAuth()
    const hasUnlimitedAcess = has({ plan: 'pro' })

    useEffect(() => {
        const cached = localStorage.getItem("projects")
        if (cached) {
            setProjectList(JSON.parse(cached))
            // eslint-disable-next-line react-hooks/immutability
            getProjectList(false)
        }
        // eslint-disable-next-line react-hooks/immutability
        else { getProjectList(true) }
    }, [])

    const getProjectList = async (showLoader = true) => {
        try {
            if (showLoader) setLoading(true)

            const result = await axios.get("/api/project_list")
            setProjectList(result.data)
            localStorage.setItem("projects", JSON.stringify(result.data))
        } catch (error) {
            console.error(error)
        } finally {
            if (showLoader) setLoading(false)
        }
    }

    return (
        <Sidebar
            collapsible="icon"
            className={`overflow-hidden transition-all duration-300 ${open ? "" : "w-15!"
                }`}
            
        >
            <SidebarHeader className="px-3 py-5 flex flex-col">
                {open ? (
                    <>
                        <div className="flex gap-2 items-center">
                            <Image src="/logo.png" alt="logo" width={40} height={40} />
                            <h2 className="font-bold text-xl"><span className='text-blue-400'>Craft</span><span className='text-purple-400'>Portfolio</span></h2>
                        </div>
                    </>
                ) : (
                    <Image src="/logo.png" alt="logo" width={40} height={40} />
                )}
            </SidebarHeader>
            <SidebarContent className={`p-2 ${open ? 'overflow-y-auto' : ''}`}>
                {open?
                <>
                <SidebarGroupLabel className="font-medium text-xl text-white">Projects</SidebarGroupLabel>
                <SidebarGroup >
                    <div>
                        {
                            loading ? [1, 2, 3, 4, 5].map((_, index) => (
                                <Skeleton key={index} className="w-full h-10 rounded-2xl mt-2" />
                            ))
                            :
                            projectList.length === 0 ?
                            <div className="text-gray-500">No Project Found!</div>
                                    :
                                    projectList.map((project: any) => (
                                        <Link key={project.projectId} href={`/playground/${project.projectId}?frameId=${project.frameId}`}>
                                            <div className=" p-2 hover:rounded-2xl hover:bg-black hover:text-white text-gray-300 ">
                                                <h2 className="line-clamp-2">
                                                    {project?.chats[0].chatMessage[0].content || "Untitled Project"}
                                                </h2>
                                            </div>
                                        </Link>
                                    ))
                                }
                    </div>
                </SidebarGroup>
                </>
                :
                <SidebarGroup>
                    <div className="flex flex-col items-center justify-center ">
                        <button className="hover:bg-black rounded-full text-gray-300 p-3 hover:text-white"><SquarePen/></button>                        
                        <button className="hover:bg-black rounded-full text-gray-300 p-3 hover:text-white"><MessageCircle/></button>                        

                    </div>
                </SidebarGroup>
            }
            </SidebarContent>

            <SidebarFooter className="mb-5">
                {
                    open?
                    <>
                {!hasUnlimitedAcess && <div className="p-3 space-y-3 bg-secondary border rounded-2xl">
                    <h2 className="font-bold">Remaining Credits : <span>{!userDetail ? <Loader2Icon className="animate-spin" /> : userDetail.credits}</span></h2>
                    <Progress value={userDetail ? (userDetail?.credits / 2) * 100 : null} />
                    <Link href={"/pricing"} className="w-full">
                        <Button className="w-full p-5 bg-black text-white">Upgrade to Unlimited</Button>
                    </Link>
                </div>
                }
                </>
                :
                <div className="flex justify-center items-center">
                    <UserButton/>
                </div>
            }
            </SidebarFooter>
        </Sidebar>
    )
}