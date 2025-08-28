import { AppLayout } from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

export default function SettingsPage() {
    return (
        <AppLayout>
            <div className="mx-auto grid max-w-4xl gap-6">
                 <Card>
                    <CardHeader>
                        <CardTitle className="font-headline">Settings</CardTitle>
                        <CardDescription>Manage your account settings and preferences.</CardDescription>
                    </CardHeader>
                    <CardContent className="grid gap-6">
                        <div className="flex items-center justify-between space-x-2 rounded-lg border p-4">
                            <div className="space-y-0.5">
                                <Label htmlFor="profile-visibility" className="text-base">Profile Visibility</Label>
                                <p className="text-sm text-muted-foreground">
                                    Control whether your profile is visible to others in search results.
                                </p>
                            </div>
                            <Switch id="profile-visibility" defaultChecked />
                        </div>

                         <div className="flex items-center justify-between space-x-2 rounded-lg border p-4">
                            <div className="space-y-0.5">
                                <Label htmlFor="message-notifications" className="text-base">Message Notifications</Label>
                                <p className="text-sm text-muted-foreground">
                                    Receive email notifications for new messages.
                                </p>
                            </div>
                            <Switch id="message-notifications" defaultChecked />
                        </div>

                        <div className="flex items-center justify-between space-x-2 rounded-lg border p-4">
                            <div className="space-y-0.5">
                                <Label htmlFor="match-notifications" className="text-base">New Match Alerts</Label>
                                <p className="text-sm text-muted-foreground">
                                   Get notified when you have new AI-suggested matches.
                                </p>
                            </div>
                            <Switch id="match-notifications" />
                        </div>
                    </CardContent>
                </Card>
                 <Card>
                    <CardHeader>
                        <CardTitle className="font-headline text-destructive">Danger Zone</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="font-semibold">Delete Account</h3>
                                <p className="text-sm text-muted-foreground">Permanently delete your account and all associated data. This action cannot be undone.</p>
                            </div>
                            <Button variant="destructive">Delete Account</Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
