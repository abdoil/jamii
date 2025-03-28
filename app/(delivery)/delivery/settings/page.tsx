"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/auth-provider";
import { DeliveryLayout } from "@/components/delivery/delivery-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/components/ui/use-toast";
import { Wallet, Shield } from "lucide-react";

export default function SettingsPage() {
  const { user, connectWallet, isWalletConnected } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);

  // Profile settings
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [bio, setBio] = useState("");

  // Delivery settings
  const [deliveryRadius, setDeliveryRadius] = useState("5");
  const [vehicleType, setVehicleType] = useState("bicycle");
  const [availableHours, setAvailableHours] = useState({
    monday: true,
    tuesday: true,
    wednesday: true,
    thursday: true,
    friday: true,
    saturday: false,
    sunday: false,
  });

  // Notification settings
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(true);
  const [newJobAlerts, setNewJobAlerts] = useState(true);
  const [paymentAlerts, setPaymentAlerts] = useState(true);

  useEffect(() => {
    if (!user) {
      router.push("/auth/signin");
      return;
    }

    if (user.role !== "delivery") {
      router.push("/");
      return;
    }

    // Simulate loading user data
    setIsLoading(true);
    setTimeout(() => {
      // Mock data
      setName(user.name);
      setEmail(user.email);
      setPhone("+1 (555) 123-4567");
      setBio(
        "Experienced delivery agent with 2 years of service. Fast and reliable deliveries guaranteed."
      );
      setIsLoading(false);
    }, 1000);
  }, [user, router]);

  const handleSaveProfile = async () => {
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      toast({
        title: "Profile updated",
        description: "Your profile information has been saved",
      });
    } catch (error) {
      toast({
        title: "Update failed",
        description: "Failed to update profile information",
        variant: "destructive",
      });
    }
  };

  const handleSaveDeliverySettings = async () => {
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      toast({
        title: "Delivery settings updated",
        description: "Your delivery preferences have been saved",
      });
    } catch (error) {
      toast({
        title: "Update failed",
        description: "Failed to update delivery settings",
        variant: "destructive",
      });
    }
  };

  const handleSaveNotificationSettings = async () => {
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      toast({
        title: "Notification settings updated",
        description: "Your notification preferences have been saved",
      });
    } catch (error) {
      toast({
        title: "Update failed",
        description: "Failed to update notification settings",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <p>Loading settings...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">
          Manage your account settings and preferences
        </p>
      </div>

      <Tabs defaultValue="profile" className="space-y-4">
        <TabsList>
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="delivery">Delivery</TabsTrigger>
          <TabsTrigger value="wallet">Wallet</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
        </TabsList>

        <TabsContent value="profile">
          <Card>
            <CardHeader>
              <CardTitle>Profile Information</CardTitle>
              <CardDescription>
                Update your personal information and public profile
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <Input
                      id="name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bio">Bio</Label>
                  <Textarea
                    id="bio"
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    rows={4}
                    placeholder="Tell customers about yourself and your delivery service"
                  />
                  <p className="text-sm text-muted-foreground">
                    This will be displayed on your public profile
                  </p>
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <h3 className="text-lg font-medium">Identity Verification</h3>
                <p className="text-sm text-muted-foreground">
                  Verify your identity to increase trust and get more delivery
                  opportunities
                </p>

                <div className="flex items-center justify-between rounded-lg border p-4">
                  <div className="flex items-center gap-2">
                    <Shield className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium">ID Verification</p>
                      <p className="text-sm text-muted-foreground">
                        Upload a government-issued ID
                      </p>
                    </div>
                  </div>
                  <Button variant="outline">Verify</Button>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={handleSaveProfile}>Save Changes</Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="delivery">
          <Card>
            <CardHeader>
              <CardTitle>Delivery Preferences</CardTitle>
              <CardDescription>
                Customize your delivery settings and availability
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="deliveryRadius">
                    Delivery Radius (miles)
                  </Label>
                  <Input
                    id="deliveryRadius"
                    type="number"
                    value={deliveryRadius}
                    onChange={(e) => setDeliveryRadius(e.target.value)}
                    min="1"
                    max="20"
                  />
                  <p className="text-sm text-muted-foreground">
                    You'll only see jobs within this distance from your location
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="vehicleType">Vehicle Type</Label>
                  <Select value={vehicleType} onValueChange={setVehicleType}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select vehicle type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="bicycle">Bicycle</SelectItem>
                      <SelectItem value="motorcycle">Motorcycle</SelectItem>
                      <SelectItem value="car">Car</SelectItem>
                      <SelectItem value="van">Van</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Available Days</Label>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="monday"
                        checked={availableHours.monday}
                        onCheckedChange={(checked) =>
                          setAvailableHours({
                            ...availableHours,
                            monday: checked,
                          })
                        }
                      />
                      <Label htmlFor="monday">Monday</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="tuesday"
                        checked={availableHours.tuesday}
                        onCheckedChange={(checked) =>
                          setAvailableHours({
                            ...availableHours,
                            tuesday: checked,
                          })
                        }
                      />
                      <Label htmlFor="tuesday">Tuesday</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="wednesday"
                        checked={availableHours.wednesday}
                        onCheckedChange={(checked) =>
                          setAvailableHours({
                            ...availableHours,
                            wednesday: checked,
                          })
                        }
                      />
                      <Label htmlFor="wednesday">Wednesday</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="thursday"
                        checked={availableHours.thursday}
                        onCheckedChange={(checked) =>
                          setAvailableHours({
                            ...availableHours,
                            thursday: checked,
                          })
                        }
                      />
                      <Label htmlFor="thursday">Thursday</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="friday"
                        checked={availableHours.friday}
                        onCheckedChange={(checked) =>
                          setAvailableHours({
                            ...availableHours,
                            friday: checked,
                          })
                        }
                      />
                      <Label htmlFor="friday">Friday</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="saturday"
                        checked={availableHours.saturday}
                        onCheckedChange={(checked) =>
                          setAvailableHours({
                            ...availableHours,
                            saturday: checked,
                          })
                        }
                      />
                      <Label htmlFor="saturday">Saturday</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="sunday"
                        checked={availableHours.sunday}
                        onCheckedChange={(checked) =>
                          setAvailableHours({
                            ...availableHours,
                            sunday: checked,
                          })
                        }
                      />
                      <Label htmlFor="sunday">Sunday</Label>
                    </div>
                  </div>
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <h3 className="text-lg font-medium">Delivery Equipment</h3>
                <p className="text-sm text-muted-foreground">
                  Select the equipment you have available for deliveries
                </p>

                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Switch id="thermal-bag" defaultChecked />
                    <Label htmlFor="thermal-bag">Thermal Bag</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch id="cooler" />
                    <Label htmlFor="cooler">Cooler</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch id="cargo-box" />
                    <Label htmlFor="cargo-box">Cargo Box</Label>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={handleSaveDeliverySettings}>
                Save Preferences
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="wallet">
          <Card>
            <CardHeader>
              <CardTitle>Wallet Settings</CardTitle>
              <CardDescription>
                Manage your Hedera wallet and payment preferences
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="rounded-lg border p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Wallet className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="font-medium">Hedera Wallet</p>
                        <p className="text-sm text-muted-foreground">
                          {isWalletConnected
                            ? `Connected: ${user?.walletAddress}`
                            : "Not connected"}
                        </p>
                      </div>
                    </div>
                    {!isWalletConnected ? (
                      <Button onClick={connectWallet}>Connect Wallet</Button>
                    ) : (
                      <Button variant="outline">Disconnect</Button>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Payment Method</Label>
                  <Select defaultValue="automatic">
                    <SelectTrigger>
                      <SelectValue placeholder="Select payment method" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="automatic">
                        Automatic (After delivery)
                      </SelectItem>
                      <SelectItem value="weekly">Weekly payout</SelectItem>
                      <SelectItem value="monthly">Monthly payout</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-sm text-muted-foreground">
                    Choose how you want to receive your earnings
                  </p>
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <h3 className="text-lg font-medium">Transaction History</h3>
                <p className="text-sm text-muted-foreground">
                  View your recent transactions and payment history
                </p>

                <Button
                  variant="outline"
                  onClick={() => router.push("/delivery/earnings")}
                >
                  View Transaction History
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle>Notification Preferences</CardTitle>
              <CardDescription>
                Manage how and when you receive notifications
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="email-notifications">
                      Email Notifications
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Receive notifications via email
                    </p>
                  </div>
                  <Switch
                    id="email-notifications"
                    checked={emailNotifications}
                    onCheckedChange={setEmailNotifications}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="push-notifications">
                      Push Notifications
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Receive notifications on your device
                    </p>
                  </div>
                  <Switch
                    id="push-notifications"
                    checked={pushNotifications}
                    onCheckedChange={setPushNotifications}
                  />
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <h3 className="text-lg font-medium">Notification Types</h3>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="new-job-alerts">New Job Alerts</Label>
                    <p className="text-sm text-muted-foreground">
                      Get notified when new delivery jobs are available
                    </p>
                  </div>
                  <Switch
                    id="new-job-alerts"
                    checked={newJobAlerts}
                    onCheckedChange={setNewJobAlerts}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="payment-alerts">Payment Alerts</Label>
                    <p className="text-sm text-muted-foreground">
                      Get notified about payments and earnings
                    </p>
                  </div>
                  <Switch
                    id="payment-alerts"
                    checked={paymentAlerts}
                    onCheckedChange={setPaymentAlerts}
                  />
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={handleSaveNotificationSettings}>
                Save Preferences
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
