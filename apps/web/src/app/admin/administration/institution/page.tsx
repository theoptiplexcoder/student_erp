'use client';
import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardContent } from '@student-erp/ui';
import { Settings, User, Calendar, BookMarked, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

export default function InstitutionPage() {
  const links = [
    {
      title: 'Profile',
      description: 'Manage institution profile and details',
      href: '/admin/administration/institution/profile',
      icon: User,
      color: 'text-blue-600',
      bg: 'bg-blue-100',
    },
    {
      title: 'Settings',
      description: 'Configure global institution settings',
      href: '/admin/administration/institution/settings',
      icon: Settings,
      color: 'text-gray-600',
      bg: 'bg-gray-100',
    },
    {
      title: 'Academic Year',
      description: 'Set up and manage academic years',
      href: '/admin/administration/institution/academic-year',
      icon: BookMarked,
      color: 'text-emerald-600',
      bg: 'bg-emerald-100',
    },
    {
      title: 'Calendar',
      description: 'Manage holidays and working days',
      href: '/admin/administration/institution/calendar',
      icon: Calendar,
      color: 'text-purple-600',
      bg: 'bg-purple-100',
    },
  ];

  return (
    <div className="min-h-[calc(100vh-4rem)] space-y-8 bg-gray-50/30 p-8 dark:bg-gray-900/30">
      <div className="mx-auto max-w-4xl space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Institution Management</h1>
          <p className="text-muted-foreground mt-2 text-lg">
            Configure and manage all core aspects of your institution.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {links.map((link, i) => (
            <motion.div
              key={link.href}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
            >
              <Link href={link.href} className="group block">
                <Card className="h-full bg-white transition-all duration-300 hover:border-gray-300 hover:shadow-md dark:bg-gray-950 dark:hover:border-gray-600">
                  <CardContent className="flex items-start space-x-4 p-6">
                    <div className={`rounded-xl p-3 ${link.bg} dark:bg-opacity-20`}>
                      <link.icon className={`h-6 w-6 ${link.color}`} />
                    </div>
                    <div className="flex-1 space-y-1">
                      <h3 className="flex items-center text-lg font-semibold transition-colors group-hover:text-blue-600">
                        {link.title}
                        <ArrowRight className="ml-2 h-4 w-4 -translate-x-2 opacity-0 transition-all group-hover:translate-x-0 group-hover:opacity-100" />
                      </h3>
                      <p className="text-muted-foreground text-sm leading-relaxed">
                        {link.description}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
