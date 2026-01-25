import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

const AccountInfo = () => {
  return (
    <Card className="border-t border-border rounded-none">
      <CardHeader>
        <CardTitle>账户余额</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* 总余额 */}
        <div>
          <div className="text-3xl font-bold mb-1">$10,000</div>
          <div className="text-sm text-muted-foreground">≈ ¥72,000</div>
        </div>

        {/* 操作按钮 */}
        <div className="flex gap-2">
          <Button className="flex-1">充值</Button>
          <Button variant="outline" className="flex-1">提现</Button>
        </div>

        {/* 盈亏信息 */}
        <div className="space-y-2 pt-4 border-t border-border">
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">未实现盈亏</span>
            <span className="text-green-400">+$0.00</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">已实现盈亏</span>
            <span className="text-foreground">$0.00</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default AccountInfo
