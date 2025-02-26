"use client";

import React, { useState } from "react";
import {
  CheckCircle,
  ShoppingCart,
  X,
  AlertTriangle,
  Flame,
  Utensils,
  Beef,
  Egg,
  Leaf,
  Thermometer,
  ArrowRight,
} from "lucide-react";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner"

interface ConfiguratorState {
  cutletType: string;
  sauceType: string;
  riceType: string;
  cabbageShredded: boolean;
  misoSoup: boolean;
  spicinessLevel: number;
}

const defaultState: ConfiguratorState = {
  cutletType: "Pork Loin",
  sauceType: "Tonkatsu Sauce",
  riceType: "White Rice",
  cabbageShredded: true,
  misoSoup: true,
  spicinessLevel: 0,
};

const isClassicTonkatsu = (config: ConfiguratorState): boolean => {
  return (
    config.cutletType === "Pork Loin" &&
    config.sauceType === "Tonkatsu Sauce" &&
    config.riceType === "White Rice" &&
    config.cabbageShredded &&
    config.misoSoup &&
    config.spicinessLevel === 0
  );
};

// Fun animations for special combinations
const getSpecialComboMessage = (config: ConfiguratorState): string | null => {
  if (
    config.cutletType === "Tofu" &&
    config.sauceType === "No Sauce" &&
    config.riceType === "No Rice"
  ) {
    return "You've unlocked the 'Why Even Bother?' combo! Literally just a plain tofu cutlet. Are you okay?";
  }
  if (
    config.cutletType === "Pork Loin" &&
    config.spicinessLevel === 10 &&
    config.sauceType === "Spicy Mayo"
  ) {
    return "You've unlocked the 'Tomorrow's Regret' combo! Your taste buds send their final regards.";
  }
  if (
    !config.cabbageShredded &&
    !config.misoSoup &&
    config.riceType === "No Rice"
  ) {
    return "You've unlocked the 'Just The Meat' combo! We respect your carnivorous ways.";
  }
  return null;
};

export default function TonkatsuConfigurator() {
  const [config, setConfig] = useState<ConfiguratorState>(defaultState);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [insult, setInsult] = useState<string>("");
  const [showConfetti, setShowConfetti] = useState(false);
  const handleConfigChange = (
    field: keyof ConfiguratorState,
    value: string | boolean | number
  ) => {
    setConfig((prevConfig) => ({
      ...prevConfig,
      [field]: value,
    }));
  };

  const handleReset = () => {
    setConfig(defaultState);
    setOrderPlaced(false);
    setInsult("");
    toast.info(
      "Starting over with a clean plate. Maybe you'll make better choices this time?"
    );
  };

  const handleSubmit = () => {
    // Special combinations with funny alerts
    if (config.cutletType === "Tofu" && config.sauceType === "No Sauce") {
      toast.warning(
        "Seriously? Tofu with no sauce? We're judging you... but okay, order placed!",
        {
          icon: <AlertTriangle className="h-5 w-5 text-yellow-500" />,
        }
      );
    } else if (config.spicinessLevel === 10) {
      toast.error(
        "🔥 Warning! You have chosen maximum spiciness! Prepare for a culinary inferno! We are not responsible for any resulting heartburn. 🔥",
        {
          icon: <Flame className="h-5 w-5 text-red-500" />,
          duration: 5000,
        }
      );
    }

    // Check for special combinations
    const specialCombo = getSpecialComboMessage(config);
    if (specialCombo) {
      toast.success(specialCombo, { duration: 5000 });
    }

    if (!isClassicTonkatsu(config)) {
      const insults = [
        "Wow, you really butchered the classic tonkatsu, didn't you?",
        "Interesting choices... if you can even call that tonkatsu anymore.",
        "Are you sure about that? Your ancestors are weeping softly in the distance.",
        "That's... one way to ruin a perfectly good meal. Enjoy?",
        "We'll make it, but we won't be happy about it. This is an insult to tonkatsu!",
        "You call that...tonkatsu? My grandma just rolled over in her grave. Twice.",
        "The chef just took one look at your order and requested early retirement.",
        "Congratulations on creating something so unique that we don't even have a name for it anymore.",
        "Your order triggered our 'culinary abomination' alert system.",
        "We've just contacted the Japanese embassy. Expect a strongly worded letter.",
      ];
      setInsult(insults[Math.floor(Math.random() * insults.length)]);
    } else {
      setInsult(
        "Perfection! A true tonkatsu connoisseur! Our chef is shedding tears of joy."
      );
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 3000);
    }

    setOrderPlaced(true);
    toast.success(
      "Order placed! Your creation is being prepared with varying levels of enthusiasm."
    );
  };

  // Determine the level of chef despair based on how far from classic tonkatsu
  const getChefDespairLevel = () => {
    let despairPoints = 0;
    if (config.cutletType !== "Pork Loin") despairPoints += 1;
    if (config.sauceType !== "Tonkatsu Sauce") despairPoints += 1;
    if (config.riceType !== "White Rice") despairPoints += 1;
    if (!config.cabbageShredded) despairPoints += 1;
    if (!config.misoSoup) despairPoints += 1;
    if (config.spicinessLevel > 5) despairPoints += 1;

    if (despairPoints === 0) return "Chef's Joy";
    if (despairPoints <= 2) return "Mild Concern";
    if (despairPoints <= 4) return "Significant Worry";
    return "Complete Despair";
  };

  const getSpiceLevelEmoji = () => {
    if (config.spicinessLevel === 0) return "😌";
    if (config.spicinessLevel < 3) return "😊";
    if (config.spicinessLevel < 5) return "😅";
    if (config.spicinessLevel < 7) return "🥵";
    if (config.spicinessLevel < 9) return "🔥";
    return "☠️";
  };

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <Card className="mb-8 border-4 border-yellow-400">
        <CardHeader className="bg-yellow-50">
          <CardTitle className="text-3xl font-bold text-center">
            Build Your Dream Tonkatsu{" "}
            <span role="img" aria-label="pig">
              🐷
            </span>
          </CardTitle>
          <CardDescription className="text-center text-lg">
            (Or Nightmare? We Don't Judge... Much)
          </CardDescription>
        </CardHeader>
      </Card>

      {orderPlaced ? (
        <Alert
          variant={isClassicTonkatsu(config) ? "default" : "destructive"}
          className="my-6 animate-bounce"
        >
          <CheckCircle className="h-4 w-4" />
          <AlertTitle className="text-lg font-bold">
            Order Confirmed!
          </AlertTitle>
          <AlertDescription>
            Your{" "}
            {isClassicTonkatsu(config)
              ? "masterpiece"
              : "potentially questionable creation"}{" "}
            is on its way!
            {insult && <p className="mt-2 italic font-semibold">{insult}</p>}
            <Button
              variant="outline"
              size="sm"
              className="mt-2"
              onClick={() => setOrderPlaced(false)}
            >
              <X className="mr-2 h-4 w-4" /> Close
            </Button>
          </AlertDescription>
        </Alert>
      ) : (
        <Alert className="my-6" variant="warning">
          <ShoppingCart className="h-4 w-4" />
          <AlertTitle>Ready to Order?</AlertTitle>
          <AlertDescription>
            Don't forget to place your order when you're done customizing your
            culinary masterpiece (or disaster)!
          </AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Beef className="mr-2" /> Cutlet Type
            </CardTitle>
            <CardDescription>Choose your protein (or... tofu)</CardDescription>
          </CardHeader>
          <CardContent>
            <RadioGroup
              value={config.cutletType}
              onValueChange={(value) => handleConfigChange("cutletType", value)}
              className="space-y-3"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="Pork Loin" id="cutlet-pork" />
                <Label htmlFor="cutlet-pork" className="text-lg">
                  Pork Loin <Badge variant="outline">Classic</Badge>
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="Chicken Breast" id="cutlet-chicken" />
                <Label htmlFor="cutlet-chicken" className="text-lg">
                  Chicken Breast{" "}
                  <Badge variant="secondary">For The Cautious</Badge>
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="Tofu" id="cutlet-tofu" />
                <Label htmlFor="cutlet-tofu" className="text-lg">
                  Tofu <Badge variant="destructive">Brave Choice</Badge>
                </Label>
              </div>
            </RadioGroup>
          </CardContent>

          <CardHeader className="pt-6">
            <CardTitle className="flex items-center">
              <Utensils className="mr-2" /> Sauce Selection
            </CardTitle>
            <CardDescription>What's a cutlet without sauce?</CardDescription>
          </CardHeader>
          <CardContent>
            <RadioGroup
              value={config.sauceType}
              onValueChange={(value) => handleConfigChange("sauceType", value)}
              className="space-y-3"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="Tonkatsu Sauce" id="sauce-tonkatsu" />
                <Label htmlFor="sauce-tonkatsu" className="text-lg">
                  Tonkatsu Sauce <Badge variant="outline">Traditional</Badge>
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="Spicy Mayo" id="sauce-mayo" />
                <Label htmlFor="sauce-mayo" className="text-lg">
                  Spicy Mayo <Badge variant="secondary">Bold Choice</Badge>
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="No Sauce" id="sauce-none" />
                <Label htmlFor="sauce-none" className="text-lg">
                  No Sauce{" "}
                  <Badge variant="destructive">Chef is Concerned</Badge>
                </Label>
              </div>
            </RadioGroup>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Egg className="mr-2" /> Rice Selection
            </CardTitle>
            <CardDescription>The foundation of any good meal</CardDescription>
          </CardHeader>
          <CardContent>
            <RadioGroup
              value={config.riceType}
              onValueChange={(value) => handleConfigChange("riceType", value)}
              className="space-y-3"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="White Rice" id="rice-white" />
                <Label htmlFor="rice-white" className="text-lg">
                  White Rice <Badge variant="outline">Classic Choice</Badge>
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="Brown Rice" id="rice-brown" />
                <Label htmlFor="rice-brown" className="text-lg">
                  Brown Rice <Badge variant="secondary">Health Conscious</Badge>
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="No Rice" id="rice-none" />
                <Label htmlFor="rice-none" className="text-lg">
                  No Rice <Badge variant="destructive">Carb Avoider</Badge>
                </Label>
              </div>
            </RadioGroup>
          </CardContent>

          <CardHeader className="pt-6">
            <CardTitle className="flex items-center">
              <Leaf className="mr-2" /> Side Dishes
            </CardTitle>
            <CardDescription>
              Complete your meal (or don't, we're not your mom)
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="cabbage"
                checked={config.cabbageShredded}
                onCheckedChange={(checked) =>
                  handleConfigChange("cabbageShredded", Boolean(checked))
                }
              />
              <Label htmlFor="cabbage" className="text-lg">
                Shredded Cabbage{" "}
                <span className="text-sm text-gray-500">
                  (It's basically a salad, right?)
                </span>
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="miso"
                checked={config.misoSoup}
                onCheckedChange={(checked) =>
                  handleConfigChange("misoSoup", Boolean(checked))
                }
              />
              <Label htmlFor="miso" className="text-lg">
                Miso Soup{" "}
                <span className="text-sm text-gray-500">
                  (Liquid comfort in a bowl)
                </span>
              </Label>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="mt-8">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Thermometer className="mr-2" /> Spiciness Level{" "}
            {getSpiceLevelEmoji()}
          </CardTitle>
          <CardDescription>
            How much do you hate your taste buds?
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Slider
            defaultValue={[0]}
            max={10}
            step={1}
            value={[config.spicinessLevel]}
            onValueChange={(vals) =>
              handleConfigChange("spicinessLevel", vals[0])
            }
            className="my-6"
          />
          <div className="flex justify-between text-xs px-2">
            <span>Mild</span>
            <span>Medium</span>
            <span>Hot</span>
            <span>Very Hot</span>
            <span className="text-red-500 font-bold">INFERNO</span>
          </div>
          <div className="mt-4 text-center">
            <Badge
              variant={
                config.spicinessLevel >= 7
                  ? "destructive"
                  : config.spicinessLevel >= 4
                  ? "secondary"
                  : "outline"
              }
              className="text-lg py-1"
            >
              {config.spicinessLevel === 0
                ? "Not Spicy At All (Mild)"
                : config.spicinessLevel < 4
                ? "A Little Kick (Medium)"
                : config.spicinessLevel < 7
                ? "Getting Pretty Spicy (Hot)"
                : config.spicinessLevel < 10
                ? "Extremely Spicy! (Very Hot)"
                : "DANGER ZONE!!! (Inferno)"}
            </Badge>
          </div>
        </CardContent>
      </Card>

      <Card className="mt-8 bg-yellow-50">
        <CardHeader>
          <CardTitle>Chef's Despair Meter</CardTitle>
          <CardDescription>
            How much is your order making our chef question their career
            choices?
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="w-full bg-gray-200 rounded-full h-4 dark:bg-gray-700">
            <div
              className={`h-4 rounded-full ${
                isClassicTonkatsu(config)
                  ? "bg-green-500"
                  : getChefDespairLevel() === "Mild Concern"
                  ? "bg-yellow-400"
                  : getChefDespairLevel() === "Significant Worry"
                  ? "bg-orange-500"
                  : "bg-red-600"
              }`}
              style={{
                width: isClassicTonkatsu(config)
                  ? "5%"
                  : getChefDespairLevel() === "Mild Concern"
                  ? "35%"
                  : getChefDespairLevel() === "Significant Worry"
                  ? "70%"
                  : "100%",
              }}
            ></div>
          </div>
          <p className="text-center mt-2 font-medium">
            {isClassicTonkatsu(config)
              ? "Chef's Joy: You've ordered a proper tonkatsu!"
              : `${getChefDespairLevel()}: ${
                  getChefDespairLevel() === "Mild Concern"
                    ? "The chef is raising an eyebrow"
                    : getChefDespairLevel() === "Significant Worry"
                    ? "The chef is muttering under their breath"
                    : "The chef is contemplating a career change"
                }`}
          </p>
        </CardContent>
      </Card>

      <div className="flex justify-center mt-8 space-x-4">
        <Button
          size="lg"
          variant="default"
          className="bg-yellow-500 hover:bg-yellow-600"
          onClick={handleSubmit}
        >
          <ShoppingCart className="mr-2 h-5 w-5" />
          Place Order (At Your Own Risk)
        </Button>
        <Button size="lg" variant="outline" onClick={handleReset}>
          <X className="mr-2 h-5 w-5" />
          Reset (And Pretend This Never Happened)
        </Button>
      </div>

      {/* Easter egg for classic tonkatsu order */}
      {showConfetti && (
        <div className="fixed inset-0 pointer-events-none z-50">
          {Array.from({ length: 100 }).map((_, i) => (
            <div
              key={i}
              className="absolute animate-fall"
              style={{
                left: `${Math.random() * 100}%`,
                top: `-${Math.random() * 20}px`,
                animationDuration: `${Math.random() * 3 + 2}s`,
                animationDelay: `${Math.random() * 2}s`,
              }}
            >
              {["🐷", "🍜", "🍚", "🥢", "🇯🇵"][Math.floor(Math.random() * 5)]}
            </div>
          ))}
        </div>
      )}

      <style jsx global>{`
        @keyframes fall {
          0% {
            transform: translateY(0) rotate(0deg);
            opacity: 1;
          }
          100% {
            transform: translateY(100vh) rotate(360deg);
            opacity: 0;
          }
        }
        .animate-fall {
          animation: fall linear forwards;
        }
      `}</style>
    </div>
  );
}
