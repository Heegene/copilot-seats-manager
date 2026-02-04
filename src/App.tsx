import { useState, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Skeleton } from "@/components/ui/skeleton"
import { toast, Toaster } from "sonner"
import { motion, AnimatePresence } from "framer-motion"
import {
  Warning,
  Gear,
  MagnifyingGlass,
  Trash,
  FloppyDisk,
  SpinnerGap,
  CheckCircle,
  Eye,
  EyeSlash,
  Sparkle,
  Users,
} from "@phosphor-icons/react"

// i18n 번역
const translations = {
  ko: {
    title: "Copilot Seat Manager",
    subtitle: "GitHub Copilot 시트 관리",
    warning: "시트 제거 시 'pending cancellation' 상태가 되며, 현재 빌링 사이클 종료 시점에 실제 접근이 해제됩니다.",
    warningLabel: "주의:",
    settings: "설정",
    enterpriseSlug: "Enterprise Slug",
    pat: "Personal Access Token (Classic)",
    patScopes: "필수 스코프: manage_billing:copilot, read:user",
    validateSettings: "설정 확인",
    inactiveSearch: "비활성 사용자 검색",
    inactiveDays: "비활성 기간 (일)",
    inactiveDaysHelp: "마지막 활동이 입력한 일수 이전인 사용자를 검색합니다",
    inactiveDaysZeroHelp: "0일 입력 시 모든 사용자가 반환됩니다",
    search: "검색",
    searching: "검색 중...",
    searchResults: "검색 결과",
    selectAll: "전체 선택",
    removeSeats: "시트 제거",
    orgTeam: "Organization / Team",
    username: "Username",
    email: "Email",
    lastActivity: "마지막 활동",
    noActivity: "활동 없음",
    noUsersFound: "조건에 맞는 사용자가 없습니다",
    confirmTitle: "시트 제거 확인",
    confirmDesc: "명의 사용자 시트를 제거하시겠습니까?",
    confirmDescPrefix: "선택한 ",
    confirmWarning: "⚠️ 이 작업은 현재 빌링 사이클 종료 시 적용됩니다.",
    cancel: "취소",
    enterpriseDirect: "(Enterprise 직접 할당)",
    organizationDirect: "(Organization 직접 할당)",
    enterpriseTeam: "(Enterprise Team)",
    organizationTeam: "(Organization Team)",
    pendingDeletion: "삭제 예정",
    // Toast messages
    enterEnterprise: "Enterprise slug를 입력해주세요",
    enterPat: "Personal Access Token을 입력해주세요",
    settingsConfirmed: "설정이 확인되었습니다. 검색을 진행할 수 있습니다.",
    saveSettingsFirst: "먼저 설정을 저장해주세요",
    enterValidDays: "유효한 일수를 입력해주세요",
    noInactiveUsers: "조건에 맞는 비활성 사용자가 없습니다",
    foundInactiveUsers: "명의 비활성 사용자를 찾았습니다",
    apiError: "API 오류",
    seatQueryError: "시트 조회 중 오류가 발생했습니다",
    alreadyPending: "에 삭제 예정입니다.",
    teamLevelUsers: "팀 레벨 할당 사용자",
    teamAssignedWarning: "을 통해 할당된 사용자입니다. 팀 레벨에서 제거해야 합니다.",
    partialRemovalFailed: "일부 시트 제거 실패",
    seatsCancelled: "개의 시트가 취소 예정됨",
    seatRemovalError: "시트 제거 중 오류가 발생했습니다",
    unknownError: "알 수 없는 오류",
  },
  en: {
    title: "Copilot Seat Manager",
    subtitle: "Manage GitHub Copilot seats",
    warning: "When seats are removed, they enter 'pending cancellation' status and access is revoked at the end of the current billing cycle.",
    warningLabel: "Note:",
    settings: "Settings",
    enterpriseSlug: "Enterprise Slug",
    pat: "Personal Access Token (Classic)",
    patScopes: "Required scopes: manage_billing:copilot, read:user",
    validateSettings: "Validate Settings",
    inactiveSearch: "Search Inactive Users",
    inactiveDays: "Inactive Period (days)",
    inactiveDaysHelp: "Search for users whose last activity was before the specified number of days",
    inactiveDaysZeroHelp: "Enter 0 to return all users",
    search: "Search",
    searching: "Searching...",
    searchResults: "Search Results",
    selectAll: "Select All",
    removeSeats: "Remove Seats",
    orgTeam: "Organization / Team",
    username: "Username",
    email: "Email",
    lastActivity: "Last Activity",
    noActivity: "No activity",
    noUsersFound: "No users found matching criteria",
    confirmTitle: "Confirm Seat Removal",
    confirmDesc: " users' seats?",
    confirmDescPrefix: "Remove seats from ",
    confirmWarning: "⚠️ This action will be applied at the end of the current billing cycle.",
    cancel: "Cancel",
    enterpriseDirect: "(Enterprise Direct)",
    organizationDirect: "(Organization Direct)",
    enterpriseTeam: "(Enterprise Team)",
    organizationTeam: "(Organization Team)",
    pendingDeletion: "Pending deletion",
    // Toast messages
    enterEnterprise: "Please enter Enterprise slug",
    enterPat: "Please enter Personal Access Token",
    settingsConfirmed: "Settings confirmed. You can proceed with the search.",
    saveSettingsFirst: "Please save settings first",
    enterValidDays: "Please enter valid number of days",
    noInactiveUsers: "No inactive users found matching criteria",
    foundInactiveUsers: " inactive users found",
    apiError: "API Error",
    seatQueryError: "Error occurred while querying seats",
    alreadyPending: "Already pending deletion on ",
    teamLevelUsers: "Team Level Assigned Users",
    teamAssignedWarning: "). Must be removed at the team level.",
    partialRemovalFailed: "Some seat removals failed",
    seatsCancelled: " seats scheduled for cancellation",
    seatRemovalError: "Error occurred while removing seats",
    unknownError: "Unknown error",
  },
}

// 브라우저 언어 감지
const getBrowserLanguage = (): 'ko' | 'en' => {
  const lang = navigator.language || (navigator as { userLanguage?: string }).userLanguage || 'en'
  return lang.startsWith('ko') ? 'ko' : 'en'
}

const t = translations[getBrowserLanguage()]
const isKorean = getBrowserLanguage() === 'ko'

interface SeatUser {
  login: string
  email?: string
  lastActivityAt: string | null
  orgOrTeam: string
  organization?: string
  assignedViaTeam: boolean
  assignmentType: 'enterprise-direct' | 'organization-direct' | 'team-assigned'
  teamName?: string
  teamType?: 'enterprise-team' | 'org-team'
  pendingCancellationDate: string | null
  selected: boolean
}

interface ApiSeat {
  assignee: {
    login: string
    avatar_url?: string
  }
  last_activity_at: string | null
  pending_cancellation_date?: string | null
  assigning_team?: {
    name: string
  }
  organization?: {
    login: string
  }
}

function App() {
  const [enterprise, setEnterprise] = useState("")
  const [pat, setPat] = useState("")
  const [showPat, setShowPat] = useState(false)
  const [inactiveDays, setInactiveDays] = useState("30")
  const [users, setUsers] = useState<SeatUser[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isRemoving, setIsRemoving] = useState(false)
  const [showConfirmDialog, setShowConfirmDialog] = useState(false)

  const selectedUsers = useMemo(
    () => users.filter((u) => u.selected),
    [users]
  )

  const allSelected = users.length > 0 && users.every((u) => u.selected)
  const someSelected = users.some((u) => u.selected) && !allSelected

  const handleValidateSettings = () => {
    if (!enterprise?.trim()) {
      toast.error(t.enterEnterprise)
      return
    }
    if (!pat?.trim()) {
      toast.error(t.enterPat)
      return
    }
    toast.success(t.settingsConfirmed)
  }

  const fetchAllSeats = async (): Promise<ApiSeat[]> => {
    const allSeats: ApiSeat[] = []
    let page = 1
    const perPage = 100

    while (true) {
      const response = await fetch(
        `https://api.github.com/enterprises/${enterprise}/copilot/billing/seats?per_page=${perPage}&page=${page}`,
        {
          headers: {
            Authorization: `Bearer ${pat}`,
            Accept: "application/vnd.github+json",
            "X-GitHub-Api-Version": "2022-11-28",
          },
        }
      )

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || `${t.apiError}: ${response.status}`)
      }

      const data = await response.json()
      const seats = data.seats || []
      allSeats.push(...seats)

      if (seats.length < perPage) break
      page++
    }

    return allSeats
  }

  const fetchUserEmail = async (username: string): Promise<string> => {
    try {
      const response = await fetch(`https://api.github.com/users/${username}`, {
        headers: {
          Authorization: `Bearer ${pat}`,
          Accept: "application/vnd.github+json",
          "X-GitHub-Api-Version": "2022-11-28",
        },
      })

      if (!response.ok) return ""

      const data = await response.json()
      return data.email || ""
    } catch {
      return ""
    }
  }

  const handleSearch = async () => {
    if (!enterprise || !pat) {
      toast.error(t.saveSettingsFirst)
      return
    }

    const days = parseInt(inactiveDays, 10)
    if (isNaN(days) || days < 0) {
      toast.error(t.enterValidDays)
      return
    }

    setIsLoading(true)
    setUsers([])

    try {
      const seats = await fetchAllSeats()
      const cutoffDate = new Date()
      cutoffDate.setDate(cutoffDate.getDate() - days)

      const inactiveSeats = seats.filter((seat) => {
        if (!seat.last_activity_at) return true
        const activityDate = new Date(seat.last_activity_at)
        return activityDate < cutoffDate
      })

      if (inactiveSeats.length === 0) {
        toast.info(t.noInactiveUsers)
        setIsLoading(false)
        return
      }

      const emailPromises = inactiveSeats.map((seat) =>
        fetchUserEmail(seat.assignee.login)
      )
      const emails = await Promise.all(emailPromises)

      const usersWithEmails: SeatUser[] = inactiveSeats.map((seat, idx) => {
        const hasTeam = !!seat.assigning_team
        const hasOrg = !!seat.organization?.login
        const teamName = seat.assigning_team?.name
        
        // 할당 타입 결정
        let assignmentType: 'enterprise-direct' | 'organization-direct' | 'team-assigned'
        if (hasTeam) {
          assignmentType = 'team-assigned'
        } else if (hasOrg) {
          assignmentType = 'organization-direct'
        } else {
          assignmentType = 'enterprise-direct'
        }
        
        // Team 타입 구분: enterprise team인지 org team인지
        let teamType: 'enterprise-team' | 'org-team' | undefined
        if (hasTeam) {
          teamType = hasOrg ? 'org-team' : 'enterprise-team'
        }
        
        return {
          login: seat.assignee.login,
          email: emails[idx],
          lastActivityAt: seat.last_activity_at,
          orgOrTeam: teamName || seat.organization?.login || "Enterprise",
          organization: seat.organization?.login,
          assignedViaTeam: hasTeam,
          assignmentType,
          teamName,
          teamType,
          pendingCancellationDate: seat.pending_cancellation_date || null,
          selected: false,
        }
      })

      setUsers(usersWithEmails)
      toast.success(isKorean ? `${usersWithEmails.length}명의 비활성 사용자를 찾았습니다` : `${usersWithEmails.length}${t.foundInactiveUsers}`)
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : t.seatQueryError
      )
    } finally {
      setIsLoading(false)
    }
  }

  const toggleSelectAll = () => {
    setUsers((current) =>
      current.map((u) => ({ ...u, selected: !allSelected }))
    )
  }

  const toggleSelectUser = (login: string) => {
    setUsers((current) =>
      current.map((u) =>
        u.login === login ? { ...u, selected: !u.selected } : u
      )
    )
  }

  const handleRemoveSeats = async () => {
    if (selectedUsers.length === 0) return

    setIsRemoving(true)
    setShowConfirmDialog(false)

    try {
      let totalCancelled = 0
      const errors: string[] = []
      const warnings: string[] = []

      // 0. 이미 삭제 예정인 사용자 필터링
      const alreadyPendingUsers = selectedUsers.filter(u => u.pendingCancellationDate)
      if (alreadyPendingUsers.length > 0) {
        alreadyPendingUsers.forEach(user => {
          const cancelDate = new Date(user.pendingCancellationDate!).toLocaleDateString(isKorean ? 'ko-KR' : 'en-US')
          warnings.push(isKorean ? `${user.login}: 이미 ${cancelDate}에 삭제 예정입니다.` : `${user.login}: ${t.alreadyPending}${cancelDate}`)
        })
      }

      // 1. Team 할당 사용자는 제거하지 않고 경고 메시지만 표시
      const teamAssignedUsers = selectedUsers.filter(u => u.assignmentType === 'team-assigned' && !u.pendingCancellationDate)
      if (teamAssignedUsers.length > 0) {
        teamAssignedUsers.forEach(user => {
          const teamTypeMsg = user.teamType === 'enterprise-team' 
            ? 'Enterprise Team' 
            : 'Organization Team'
          warnings.push(isKorean ? `${user.login}: ${teamTypeMsg} (${user.orgOrTeam})을 통해 할당된 사용자입니다. 팀 레벨에서 제거해야 합니다.` : `${user.login}: Assigned via ${teamTypeMsg} (${user.orgOrTeam}${t.teamAssignedWarning}`)
        })
      }

      // 2. Organization 직접 할당 사용자 제거 (삭제 예정이 아닌 경우만)
      const orgDirectUsers = selectedUsers.filter(u => u.assignmentType === 'organization-direct' && !u.pendingCancellationDate)
      const orgDirectUsersByOrg = orgDirectUsers.reduce((acc, user) => {
        const org = user.organization!
        if (!acc[org]) acc[org] = []
        acc[org].push(user)
        return acc
      }, {} as Record<string, SeatUser[]>)

      for (const [org, orgUsers] of Object.entries(orgDirectUsersByOrg)) {
        try {
          const response = await fetch(
            `https://api.github.com/orgs/${org}/copilot/billing/selected_users`,
            {
              method: "DELETE",
              headers: {
                Authorization: `Bearer ${pat}`,
                Accept: "application/vnd.github+json",
                "X-GitHub-Api-Version": "2022-11-28",
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                selected_usernames: orgUsers.map((u) => u.login),
              }),
            }
          )

          if (!response.ok) {
            const error = await response.json()
            errors.push(`${org}: ${error.message || `API 오류 ${response.status}`}`)
            continue
          }

          const data = await response.json()
          totalCancelled += data.seats_cancelled || 0
        } catch (error) {
          errors.push(
            `${org}: ${error instanceof Error ? error.message : "알 수 없는 오류"}`
          )
        }
      }

      // 3. Enterprise 직접 할당 사용자 제거 (삭제 예정이 아닌 경우만)
      const directUsers = selectedUsers.filter(u => u.assignmentType === 'enterprise-direct' && !u.pendingCancellationDate)
      if (directUsers.length > 0) {
        try {
          const response = await fetch(
            `https://api.github.com/enterprises/${enterprise}/copilot/billing/selected_users`,
            {
              method: "DELETE",
              headers: {
                Authorization: `Bearer ${pat}`,
                Accept: "application/vnd.github+json",
                "X-GitHub-Api-Version": "2022-11-28",
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                selected_usernames: directUsers.map((u) => u.login),
              }),
            }
          )

          if (!response.ok) {
            const error = await response.json()
            errors.push(`Enterprise: ${error.message || `API 오류 ${response.status}`}`)
          } else {
            const data = await response.json()
            totalCancelled += data.seats_cancelled || 0
          }
        } catch (error) {
          errors.push(
            `Enterprise: ${error instanceof Error ? error.message : "알 수 없는 오류"}`
          )
        }
      }

      // 경고 메시지 표시 (팀 할당 사용자)
      if (warnings.length > 0) {
        toast.warning(
          <div className="space-y-1">
            <div className="font-semibold">{t.teamLevelUsers}</div>
            {warnings.map((warn, idx) => (
              <div key={idx} className="text-xs">{warn}</div>
            ))}
          </div>,
          { duration: 10000 }
        )
      }

      // 에러 메시지 표시
      if (errors.length > 0) {
        toast.error(
          <div className="space-y-1">
            <div className="font-semibold">{t.partialRemovalFailed}</div>
            {errors.map((err, idx) => (
              <div key={idx} className="text-xs">{err}</div>
            ))}
          </div>,
          { duration: 8000 }
        )
      }

      if (totalCancelled > 0) {
        toast.success(
          <div className="flex items-center gap-2">
            <CheckCircle weight="fill" className="text-emerald-400" />
            <span>{isKorean ? `${totalCancelled}개의 시트가 취소 예정됨` : `${totalCancelled}${t.seatsCancelled}`}</span>
          </div>
        )

        // 삭제 성공한 유저를 제거하지 않고 pendingCancellationDate 설정
        const cancelledUserLogins = new Set(
          selectedUsers
            .filter(u => (u.assignmentType === 'enterprise-direct' || u.assignmentType === 'organization-direct') && !u.pendingCancellationDate)
            .map(u => u.login)
        )
        
        setUsers((current) =>
          current.map((u) => {
            if (cancelledUserLogins.has(u.login)) {
              // 빌링 사이클 종료일 계산 (다음 달 1일)
              const today = new Date()
              const nextMonth = new Date(today.getFullYear(), today.getMonth() + 1, 1)
              return {
                ...u,
                pendingCancellationDate: nextMonth.toISOString(),
                selected: false
              }
            }
            return u
          })
        )
      }
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : t.seatRemovalError
      )
    } finally {
      setIsRemoving(false)
    }
  }

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return t.noActivity
    return new Date(dateStr).toLocaleDateString(isKorean ? "ko-KR" : "en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  const isSettingsValid = enterprise && pat

  return (
    <div className="gradient-bg min-h-screen relative overflow-hidden">
      <div className="floating-orb w-96 h-96 bg-primary/20 top-[-10%] left-[-5%]" style={{ animationDelay: '0s' }} />
      <div className="floating-orb w-80 h-80 bg-accent/15 top-[60%] right-[-10%]" style={{ animationDelay: '2s' }} />
      <div className="floating-orb w-64 h-64 bg-primary/10 bottom-[-5%] left-[30%]" style={{ animationDelay: '4s' }} />
      
      <Toaster
        theme="dark"
        position="top-right"
        toastOptions={{
          style: {
            background: "oklch(0.18 0.03 280 / 0.9)",
            backdropFilter: "blur(20px)",
            border: "1px solid oklch(0.4 0.05 280 / 0.3)",
            color: "oklch(0.95 0.01 280)",
          },
        }}
      />
      
      <div className="relative z-10 p-4 md:p-8">
        <div className="mx-auto max-w-6xl space-y-8">
          <motion.header 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="flex items-center gap-4"
          >
            <div className="relative">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-primary via-accent to-primary glow-primary">
                <Sparkle weight="fill" className="h-7 w-7 text-white" />
              </div>
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-primary via-accent to-primary opacity-50 blur-xl" />
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight gradient-text">
                {t.title}
              </h1>
              <p className="text-muted-foreground text-sm mt-1">
                {t.subtitle}
              </p>
            </div>
          </motion.header>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="glass-card-accent rounded-2xl p-4 flex items-start gap-3"
          >
            <Warning weight="fill" className="h-5 w-5 text-accent shrink-0 mt-0.5" />
            <p className="text-sm text-foreground/80">
              <span className="font-medium text-accent">{t.warningLabel}</span> {t.warning}
            </p>
          </motion.div>

          <div className="grid gap-6 md:grid-cols-2">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <Card className="glass-card border-0 rounded-2xl overflow-hidden">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center gap-3 text-lg">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-primary/30 to-primary/10">
                      <Gear className="h-4 w-4 text-primary" />
                    </div>
                    {t.settings}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-5">
                  <div className="space-y-2">
                    <Label htmlFor="enterprise" className="text-muted-foreground text-sm">{t.enterpriseSlug}</Label>
                    <Input
                      id="enterprise"
                      placeholder="your-enterprise"
                      value={enterprise || ""}
                      onChange={(e) => setEnterprise(e.target.value)}
                      className="font-mono text-sm bg-secondary/50 border-border/50 focus:border-primary/50 focus:ring-primary/20 rounded-xl h-11"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="pat" className="text-muted-foreground text-sm">{t.pat}</Label>
                    <div className="relative">
                      <Input
                        id="pat"
                        type={showPat ? "text" : "password"}
                        placeholder="ghp_xxxxxxxxxxxx"
                        value={pat}
                        onChange={(e) => setPat(e.target.value)}
                        className="pr-10 font-mono text-sm bg-secondary/50 border-border/50 focus:border-primary/50 focus:ring-primary/20 rounded-xl h-11"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPat(!showPat)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                      >
                        {showPat ? <EyeSlash size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                    <p className="text-xs text-muted-foreground/70">
                      {t.patScopes}
                    </p>
                  </div>
                  <Button 
                    onClick={handleValidateSettings} 
                    className="w-full h-11 rounded-xl bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 transition-all duration-300 glow-primary"
                  >
                    <FloppyDisk className="mr-2 h-4 w-4" />
                    {t.validateSettings}
                  </Button>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <Card className="glass-card border-0 rounded-2xl overflow-hidden">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center gap-3 text-lg">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-accent/30 to-accent/10">
                      <MagnifyingGlass className="h-4 w-4 text-accent" />
                    </div>
                    {t.inactiveSearch}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-5">
                  <div className="space-y-2">
                    <Label htmlFor="days" className="text-muted-foreground text-sm">{t.inactiveDays}</Label>
                    <Input
                      id="days"
                      type="number"
                      min="0"
                      placeholder="30"
                      value={inactiveDays}
                      onChange={(e) => setInactiveDays(e.target.value)}
                      className="font-mono bg-secondary/50 border-border/50 focus:border-accent/50 focus:ring-accent/20 rounded-xl h-11"
                    />
                    <p className="text-xs text-muted-foreground/70">
                      {t.inactiveDaysHelp}
                      <br />
                      <span className="text-accent/80">{t.inactiveDaysZeroHelp}</span>
                    </p>
                  </div>
                  <Button
                    onClick={handleSearch}
                    disabled={!isSettingsValid || isLoading}
                    className="w-full h-11 rounded-xl bg-gradient-to-r from-accent to-accent/80 hover:from-accent/90 hover:to-accent/70 text-accent-foreground transition-all duration-300 glow-accent disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isLoading ? (
                      <>
                        <SpinnerGap className="mr-2 h-4 w-4 animate-spin" />
                        {t.searching}
                      </>
                    ) : (
                      <>
                        <MagnifyingGlass className="mr-2 h-4 w-4" />
                        {t.search}
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          <AnimatePresence>
            {(isLoading || users.length > 0) && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.5 }}
              >
                <Card className="glass-card border-0 rounded-2xl overflow-hidden">
                  <CardHeader className="pb-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <CardTitle className="flex items-center gap-3 text-lg">
                        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-primary/30 via-accent/20 to-primary/10">
                          <Users className="h-4 w-4 text-primary" />
                        </div>
                        {t.searchResults} 
                        {users.length > 0 && (
                          <span className="text-muted-foreground font-normal">({users.length}{isKorean ? '명' : ''})</span>
                        )}
                      </CardTitle>
                      {users.length > 0 && (
                        <div className="flex items-center gap-4">
                          <label className="flex items-center gap-2 text-sm cursor-pointer">
                            <Checkbox
                              checked={allSelected}
                              onCheckedChange={toggleSelectAll}
                              className={`${someSelected ? "opacity-50" : ""} border-primary/50 data-[state=checked]:bg-primary data-[state=checked]:border-primary`}
                            />
                            <span className="text-muted-foreground">{t.selectAll}</span>
                          </label>
                          <Button
                            variant="destructive"
                            size="sm"
                            disabled={selectedUsers.length === 0 || isRemoving}
                            onClick={() => setShowConfirmDialog(true)}
                            className="rounded-xl bg-gradient-to-r from-destructive to-destructive/80 hover:from-destructive/90 hover:to-destructive/70"
                          >
                            {isRemoving ? (
                              <SpinnerGap className="mr-2 h-4 w-4 animate-spin" />
                            ) : (
                              <Trash className="mr-2 h-4 w-4" />
                            )}
                            {t.removeSeats} ({selectedUsers.length})
                          </Button>
                        </div>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="overflow-x-auto rounded-xl border border-border/30 bg-secondary/20">
                      <Table>
                        <TableHeader>
                          <TableRow className="hover:bg-transparent border-border/30">
                            <TableHead className="w-12"></TableHead>
                            <TableHead className="text-muted-foreground">{t.orgTeam}</TableHead>
                            <TableHead className="text-muted-foreground">{t.username}</TableHead>
                            <TableHead className="text-muted-foreground">{t.email}</TableHead>
                            <TableHead className="text-muted-foreground">{t.lastActivity}</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {isLoading ? (
                            Array.from({ length: 5 }).map((_, i) => (
                              <TableRow key={i} className="border-border/20">
                                <TableCell>
                                  <Skeleton className="h-4 w-4 rounded bg-muted/50" />
                                </TableCell>
                                <TableCell>
                                  <Skeleton className="h-4 w-24 rounded bg-muted/50" />
                                </TableCell>
                                <TableCell>
                                  <Skeleton className="h-4 w-32 rounded bg-muted/50" />
                                </TableCell>
                                <TableCell>
                                  <Skeleton className="h-4 w-40 rounded bg-muted/50" />
                                </TableCell>
                                <TableCell>
                                  <Skeleton className="h-4 w-20 rounded bg-muted/50" />
                                </TableCell>
                              </TableRow>
                            ))
                          ) : users.length === 0 ? (
                            <TableRow>
                              <TableCell
                                colSpan={5}
                                className="py-12 text-center text-muted-foreground"
                              >
                                {t.noUsersFound}
                              </TableCell>
                            </TableRow>
                          ) : (
                            users.map((user, index) => (
                              <motion.tr
                                key={user.login}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.3, delay: index * 0.05 }}
                                className={`border-border/20 transition-colors ${
                                  user.pendingCancellationDate
                                    ? "bg-muted/20 opacity-60"
                                    : user.selected 
                                    ? "bg-primary/10" 
                                    : "hover:bg-muted/30"
                                }`}
                              >
                                <TableCell>
                                  <Checkbox
                                    checked={user.selected}
                                    onCheckedChange={() => toggleSelectUser(user.login)}
                                    disabled={!!user.pendingCancellationDate}
                                    className="border-primary/50 data-[state=checked]:bg-primary data-[state=checked]:border-primary disabled:opacity-30"
                                  />
                                </TableCell>
                                <TableCell className="font-medium">
                                  <div className="flex flex-col gap-1">
                                    <span>{user.orgOrTeam}</span>
                                    <span className="text-xs text-muted-foreground/60">
                                      {user.pendingCancellationDate && `⏳ ${new Date(user.pendingCancellationDate).toLocaleDateString(isKorean ? 'ko-KR' : 'en-US')} ${t.pendingDeletion}`}
                                      {!user.pendingCancellationDate && user.assignmentType === 'enterprise-direct' && t.enterpriseDirect}
                                      {!user.pendingCancellationDate && user.assignmentType === 'organization-direct' && t.organizationDirect}
                                      {!user.pendingCancellationDate && user.assignmentType === 'team-assigned' && user.teamType === 'enterprise-team' && t.enterpriseTeam}
                                      {!user.pendingCancellationDate && user.assignmentType === 'team-assigned' && user.teamType === 'org-team' && t.organizationTeam}
                                    </span>
                                  </div>
                                </TableCell>
                                <TableCell className="font-mono text-sm text-primary">
                                  {user.login}
                                </TableCell>
                                <TableCell className="font-mono text-sm text-muted-foreground">
                                  {user.email || "-"}
                                </TableCell>
                                <TableCell className="text-sm text-muted-foreground">
                                  {formatDate(user.lastActivityAt)}
                                </TableCell>
                              </motion.tr>
                            ))
                          )}
                        </TableBody>
                      </Table>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>

          <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
            <AlertDialogContent className="glass-card border-0 rounded-2xl">
              <AlertDialogHeader>
                <AlertDialogTitle className="gradient-text text-xl">{t.confirmTitle}</AlertDialogTitle>
                <AlertDialogDescription className="text-muted-foreground">
                  {t.confirmDescPrefix}<span className="text-primary font-semibold">{selectedUsers.length}{isKorean ? '명' : ''}</span>{t.confirmDesc}
                  <span className="mt-3 block text-accent text-sm">
                    {t.confirmWarning}
                  </span>
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel className="rounded-xl bg-secondary hover:bg-secondary/80 border-0">
                  {t.cancel}
                </AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleRemoveSeats}
                  className="rounded-xl bg-gradient-to-r from-destructive to-destructive/80 hover:from-destructive/90 hover:to-destructive/70 border-0"
                >
                  {t.removeSeats}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>
    </div>
  )
}

export default App
